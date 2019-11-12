class Section {
  constructor ({ title, content }) {
    this.title = title
    this.content = content
  }
}

export default article => {
  const cleanedArticle = article.replace(/<!--[\s\S]*?-->/g, '')

  return cleanedArticle.split(/\n(?=#+? [^#])/).map(section => {
    return new Section({
      title: section.match(/(?<=^#+? ).+?(?=$)/mg)[0],
      content: section.replace(/#+? [^\n]+?\n/g, '')
    })
  })
}
