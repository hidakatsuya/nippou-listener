import parse from './parse'
import format from './format'

const filterSections = (sections, sectionTitles) => {
  if (sectionTitles.length > 0) {
    return sections.filter(section => sectionTitles.includes(section.title))
  } else {
    return sections
  }
}

export default ({ title, article }, sectionTitles) => {
  const sections = parse(article)
  return format(title, filterSections(sections, sectionTitles))
}
