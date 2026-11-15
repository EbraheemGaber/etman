require("dotenv").config({path:require("path").join(__dirname,"..",".env")})
const fs=require("fs")
const path=require("path")
const crypto=require("crypto")
const mongoose=require("mongoose")
const ExcelJS=require("exceljs")
const CustomerContact=require("../models/CustomerContact")
const User=require("../models/User")

const EMAIL_INDEX_NAME="email_unique_when_present"
const arabicDigits="٠١٢٣٤٥٦٧٨٩"

const headerAliases={
    name:["اسمالعميل"],
    addressDetails:["العنوانبالتفصيل","العنوانبالنفصيل","العنوانبالنفصبل"],
    region:["المنطقة"],
    governorate:["المحافظة"],
    customerType:["نوعالعميل"],
    classification:["التصنيف"],
    phone:["تليفون1","تلفون1","هاتف1","رقمالهاتف1","موبايل1"],
    alternatePhone:["تليفون2","تلفون2","هاتف2","رقمالهاتف2","موبايل2"],
    email:["البريدالالكتروني","البريدالإلكتروني","email"]
}

const normalizeHeader=(value)=>String(value??"")
    .normalize("NFKC")
    .replace(/[\u0640\s._-]+/g,"")
    .replace(/[٠-٩]/g,(digit)=>String(arabicDigits.indexOf(digit)))
    .toLowerCase()

const getCellText=(cell)=>{
    if(cell.value===null || cell.value===undefined) return ""
    const text=typeof cell.text==="string"?cell.text:""
    if(text.trim()) return text.trim()
    const value=cell.value
    if(typeof value==="object"){
        if(typeof value.text==="string") return value.text.trim()
        if(Array.isArray(value.richText)) return value.richText.map((part)=>part.text).join("").trim()
        if(value.result!==undefined) return String(value.result).trim()
    }
    return String(value).trim()
}

const matchesHeader=(field,value)=>headerAliases[field].includes(normalizeHeader(value))

const findHeaderRow=(worksheet)=>{
    const candidates=[]
    const lastRow=Math.min(worksheet.rowCount,30)
    for(let rowNumber=1;rowNumber<=lastRow;rowNumber++){
        const row=worksheet.getRow(rowNumber)
        const columns={}
        for(const field of Object.keys(headerAliases)){
            for(let columnNumber=1;columnNumber<=worksheet.columnCount;columnNumber++){
                if(matchesHeader(field,getCellText(row.getCell(columnNumber)))){
                    columns[field]=columnNumber
                    break
                }
            }
        }
        if(columns.name && (
            columns.addressDetails
            || columns.region
            || columns.governorate
            || columns.customerType
            || columns.classification
        )){
            candidates.push({rowNumber,columns})
        }
    }
    if(!candidates.length) return null
    return candidates.sort((first,second)=>(
        Object.keys(second.columns).length-Object.keys(first.columns).length
        || first.rowNumber-second.rowNumber
    ))[0]
}

const findColumn=(worksheet,field,headerRow)=>{
    const firstRow=worksheet.getRow(headerRow)
    for(let columnNumber=1;columnNumber<=worksheet.columnCount;columnNumber++){
        if(matchesHeader(field,getCellText(firstRow.getCell(columnNumber)))){
            return columnNumber
        }
    }

    const matches=[]
    const lastRow=Math.min(worksheet.rowCount,30)
    for(let rowNumber=1;rowNumber<=lastRow;rowNumber++){
        if(rowNumber===headerRow) continue
        const row=worksheet.getRow(rowNumber)
        for(let columnNumber=1;columnNumber<=worksheet.columnCount;columnNumber++){
            if(matchesHeader(field,getCellText(row.getCell(columnNumber)))){
                matches.push({columnNumber,distance:Math.abs(rowNumber-headerRow)})
            }
        }
    }
    if(!matches.length) return undefined

    matches.sort((first,second)=>first.distance-second.distance)
    const nearest=matches[0]
    if(matches.some((match)=>match.distance===nearest.distance && match.columnNumber!==nearest.columnNumber)){
        throw new Error(`The "${field}" header appears in multiple columns near row ${headerRow}.`)
    }
    return nearest.columnNumber
}

const extractCustomers=async(filePath)=>{
    const workbook=new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    let selectedWorksheet
    let selectedHeader

    for(const worksheet of workbook.worksheets){
        const header=findHeaderRow(worksheet)
        if(header){
            selectedWorksheet=worksheet
            selectedHeader=header
            break
        }
    }
    if(!selectedWorksheet){
        throw new Error("No worksheet contains the customer-name and customer-detail headers.")
    }

    const columns={...selectedHeader.columns}
    for(const field of Object.keys(headerAliases)){
        if(!columns[field]){
            columns[field]=findColumn(selectedWorksheet,field,selectedHeader.rowNumber)
        }
    }

    const requiredFields=[
        "name",
        "addressDetails",
        "region",
        "governorate",
        "customerType",
        "classification",
        "phone",
        "alternatePhone"
    ]
    const missingFields=requiredFields.filter((field)=>!columns[field])
    if(missingFields.length){
        throw new Error(`Required customer headers are missing: ${missingFields.join(", ")}.`)
    }

    const customers=[]
    for(let rowNumber=selectedHeader.rowNumber+1;rowNumber<=selectedWorksheet.rowCount;rowNumber++){
        const row=selectedWorksheet.getRow(rowNumber)
        const name=getCellText(row.getCell(columns.name))
        const rowValues=Object.keys(columns).filter((field)=>columns[field]).map((field)=>(
            getCellText(row.getCell(columns[field]))
        ))
        if(!rowValues.some(Boolean)) continue
        if(!name){
            throw new Error(`Customer row ${rowNumber} must include a name.`)
        }

        const customer={
            importKey:crypto.createHash("sha256")
                .update(`${path.basename(filePath).toLowerCase()}\0${selectedWorksheet.name}\0${rowNumber}`)
                .digest("hex"),
            name,
            phone:getCellText(row.getCell(columns.phone)),
            alternatePhone:getCellText(row.getCell(columns.alternatePhone)),
            addressDetails:getCellText(row.getCell(columns.addressDetails)),
            region:getCellText(row.getCell(columns.region)),
            governorate:getCellText(row.getCell(columns.governorate)),
            customerType:getCellText(row.getCell(columns.customerType)),
            classification:getCellText(row.getCell(columns.classification))
        }
        if(columns.email){
            const email=getCellText(row.getCell(columns.email)).toLowerCase()
            if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
                throw new Error(`Customer row ${rowNumber} contains an invalid email address.`)
            }
            if(email) customer.email=email
        }
        customers.push(customer)
    }

    if(!customers.length){
        throw new Error("No customer records were found below the header row.")
    }
    const emailKeys=new Set()
    for(const customer of customers){
        if(customer.email && emailKeys.has(customer.email)){
            throw new Error("The sheet contains the same email address on multiple customer rows.")
        }
        if(customer.email) emailKeys.add(customer.email)
    }

    return {
        worksheetName:selectedWorksheet.name,
        customers
    }
}

const ensureEmailIndex=async()=>{
    let indexes=await CustomerContact.collection.indexes()
    let emailIndexes=indexes.filter((index)=>index.key.email===1 && index.unique)
    if(!emailIndexes.some((index)=>index.name===EMAIL_INDEX_NAME)){
        await CustomerContact.collection.createIndex(
            {email:1},
            {
                name:EMAIL_INDEX_NAME,
                unique:true,
                partialFilterExpression:{email:{$type:"string",$gt:""}}
            }
        )
        indexes=await CustomerContact.collection.indexes()
        emailIndexes=indexes.filter((index)=>index.key.email===1 && index.unique)
    }
    for(const index of emailIndexes){
        if(index.name!==EMAIL_INDEX_NAME && !index.sparse && !index.partialFilterExpression){
            await CustomerContact.collection.dropIndex(index.name)
        }
    }
}

const importCustomers=async()=>{
    const args=process.argv.slice(2)
    const fileArgument=args.find((argument)=>!argument.startsWith("--"))
    const execute=args.includes("--execute")
    if(!fileArgument){
        throw new Error("Usage: npm run import:customers -- <workbook.xlsx> [--execute]")
    }

    const filePath=path.resolve(fileArgument)
    if(!fs.existsSync(filePath)){
        throw new Error(`Workbook not found: ${filePath}`)
    }

    const {worksheetName,customers}=await extractCustomers(filePath)
    console.log(`Validated ${customers.length} customer rows from worksheet "${worksheetName}".`)
    if(!execute){
        console.log("Dry run only. Add --execute to import these customers.")
        return
    }
    if(!process.env.MONGO_URI){
        throw new Error("MONGO_URI is not configured in backend/.env")
    }

    await mongoose.connect(process.env.MONGO_URI)
    await CustomerContact.init()
    await ensureEmailIndex()

    const importedEmails=customers
        .map((customer)=>customer.email)
        .filter(Boolean)
    if(importedEmails.length){
        const existingUsers=await User.find({email:{$in:importedEmails}}).select("email").lean()
        if(existingUsers.length){
            throw new Error("One or more sheet email addresses already belong to user accounts.")
        }
        const existingContacts=await CustomerContact.find({
            email:{$in:importedEmails},
            importKey:{$nin:customers.map((customer)=>customer.importKey)}
        }).select("_id").lean()
        if(existingContacts.length){
            throw new Error("One or more sheet email addresses already belong to another customer.")
        }
    }

    const result=await CustomerContact.bulkWrite(customers.map((customer)=>{
        const {importKey,...customerFields}=customer
        return {
            updateOne:{
                filter:{importKey},
                update:{
                    $set:{...customerFields,importKey},
                    $setOnInsert:{_id:new mongoose.Types.ObjectId()}
                },
                upsert:true
            }
        }
    }),{ordered:true})
    console.log(
        `Customer import complete: ${result.upsertedCount} inserted, `
        +`${result.modifiedCount} updated, ${result.matchedCount} already current.`
    )
}

importCustomers()
    .catch((error)=>{
        console.error("Unable to import customers:",error.message)
        process.exitCode=1
    })
    .finally(async()=>{
        await mongoose.disconnect()
    })
