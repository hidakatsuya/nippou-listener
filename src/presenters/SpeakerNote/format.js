import emojiRegex from 'emoji-regex'
import Speech from 'ssml-builder'

const normalize = content => {
  return content
    // Tags
    .replace(/<(.+?)>[\s\S]*<\/\1>/g, '').replace(/<.+?\/>/g, '')
    // Article links
    .replace(/\[#(\d+): .+\/([^/]+)\]\(.+?\)/g, '')
    // Markdown emojis
    .replace(/:\w+?:/g, '')
    // Emoji characters
    .replace(new RegExp(emojiRegex(), 'g'), '')
    // Markdown Tables
    .replace(/^\|.+|$/gm, '')
}

const formatContent = content => {
  return normalize(content)
    // Markdown Images
    .replace(/!\[(.*?)\]\(.*?\)/g, '<s>ここに$1の画像</s>')
    // Markdown Links with label
    .replace(/(?<!!)\[(.*?)\]\(.*?\)/g, '<s>ここに$1のリンク</s>')
    // Image Tags
    .replace(/<img[^>]+?>/g, '<s>ここに画像</s>')
}

const formatSectionTitle = title => {
  return normalize(title).replace(/^#+? (.+?)$/mg, '$1')
}

export default (title, sections) => {
  const speech = new Speech()

  speech.paragraph(normalize(title))

  sections.forEach(section => {
    speech.paragraph(formatSectionTitle(section.title))
    speech.paragraph(formatContent(section.content))
  })

  return speech.ssml()
}
