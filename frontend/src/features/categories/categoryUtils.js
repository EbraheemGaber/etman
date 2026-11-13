export const getCategoryParentId=(category)=>{
  const parent=category?.parentCategory
  if(!parent) return null

  const parentId=typeof parent==='object'?parent._id || parent.id || parent:parent
  return String(parentId)
}

export const getRootCategories=(categories=[])=>(
  categories.filter((category)=>!getCategoryParentId(category))
)

export const getCategoryTreeIds=(categoryId,categories=[])=>{
  const categoryIds=[String(categoryId)]

  for(let index=0;index<categoryIds.length;index++){
    categories.forEach((category)=>{
      const id=String(category._id)
      if(getCategoryParentId(category)===categoryIds[index] && !categoryIds.includes(id)){
        categoryIds.push(id)
      }
    })
  }

  return categoryIds
}
