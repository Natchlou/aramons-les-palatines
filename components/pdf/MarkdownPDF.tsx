import { Link, Text, View } from "@react-pdf/renderer"

import { tw } from "./theme"

type MarkdownPDFProps = {
  content: string
}

// ───────────────── inline (gras, italique, code, liens) ─────────────────

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string }

const INLINE_REGEX =
  /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  INLINE_REGEX.lastIndex = 0
  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) })
    }
    if (match[1]) tokens.push({ type: "bold", value: match[2] })
    else if (match[3]) tokens.push({ type: "italic", value: match[4] })
    else if (match[5]) tokens.push({ type: "code", value: match[6] })
    else if (match[7])
      tokens.push({ type: "link", value: match[8], href: match[9] })
    lastIndex = INLINE_REGEX.lastIndex
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) })
  }
  return tokens
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, i) => {
        switch (token.type) {
          case "bold":
            return (
              <Text key={i} style={tw("font-bold")}>
                {token.value}
              </Text>
            )
          case "italic":
            return (
              <Text key={i} style={tw("italic")}>
                {token.value}
              </Text>
            )
          case "code":
            return (
              <Text
                key={i}
                style={tw("bg-gray-100 text-gray-800 font-mono text-[9px]")}
              >
                {" "}
                {token.value}{" "}
              </Text>
            )
          case "link":
            return (
              <Link key={i} src={token.href} style={tw("text-brand underline")}>
                {token.value}
              </Link>
            )
          default:
            return <Text key={i}>{token.value}</Text>
        }
      })}
    </>
  )
}

// ───────────────── blocs (titres, paragraphes, listes...) ─────────────────

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "hr" }
  | { type: "code"; text: string }

const BLOCK_START = /^(#{1,3}\s+|[-*]\s+|\d+\.\s+|>\s?|```)/

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      i++
      continue
    }

    if (/^```/.test(line)) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: "code", text: codeLines.join("\n") })
      continue
    }

    if (/^###\s+/.test(line)) {
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") })
      i++
      continue
    }
    if (/^##\s+/.test(line)) {
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") })
      i++
      continue
    }
    if (/^#\s+/.test(line)) {
      blocks.push({ type: "h1", text: line.replace(/^#\s+/, "") })
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") })
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" })
      i++
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""))
        i++
      }
      blocks.push({ type: "ul", items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""))
        i++
      }
      blocks.push({ type: "ol", items })
      continue
    }

    const paraLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !BLOCK_START.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push({ type: "p", text: paraLines.join(" ") })
  }

  return blocks
}

// ───────────────── composant ─────────────────

export default function MarkdownPDF({ content }: MarkdownPDFProps) {
  const blocks = parseBlocks(content)

  return (
    <View>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h1":
            return (
              <Text
                key={i}
                style={tw("text-xl font-bold text-gray-900 mt-5 mb-2")}
              >
                <InlineText text={block.text} />
              </Text>
            )
          case "h2":
            return (
              <Text
                key={i}
                style={tw("text-base font-bold text-gray-900 mt-4 mb-2")}
              >
                <InlineText text={block.text} />
              </Text>
            )
          case "h3":
            return (
              <Text
                key={i}
                style={tw("text-sm font-bold text-gray-800 mt-3 mb-1")}
              >
                <InlineText text={block.text} />
              </Text>
            )
          case "p":
            return (
              <Text
                key={i}
                style={tw("text-[10px] leading-relaxed text-gray-700 mb-3")}
              >
                <InlineText text={block.text} />
              </Text>
            )
          case "ul":
            return (
              <View key={i} style={tw("mb-3")}>
                {block.items.map((item, j) => (
                  <View key={j} style={tw("flex-row mb-1")}>
                    <Text style={tw("text-[10px] text-brand mr-2")}>•</Text>
                    <Text
                      style={tw(
                        "text-[10px] leading-relaxed text-gray-700 flex-1",
                      )}
                    >
                      <InlineText text={item} />
                    </Text>
                  </View>
                ))}
              </View>
            )
          case "ol":
            return (
              <View key={i} style={tw("mb-3")}>
                {block.items.map((item, j) => (
                  <View key={j} style={tw("flex-row mb-1")}>
                    <Text style={tw("text-[10px] text-gray-500 mr-2 w-4")}>
                      {j + 1}.
                    </Text>
                    <Text
                      style={tw(
                        "text-[10px] leading-relaxed text-gray-700 flex-1",
                      )}
                    >
                      <InlineText text={item} />
                    </Text>
                  </View>
                ))}
              </View>
            )
          case "quote":
            return (
              <View key={i} style={tw("border-l-2 border-brand pl-3 mb-3")}>
                <Text style={tw("text-[10px] italic text-gray-600")}>
                  <InlineText text={block.text} />
                </Text>
              </View>
            )
          case "hr":
            return (
              <View key={i} style={tw("border-b border-gray-200 my-4")} />
            )
          case "code":
            return (
              <View key={i} style={tw("bg-gray-100 rounded px-3 py-2 mb-3")}>
                <Text style={tw("text-[9px] font-mono text-gray-700")}>
                  {block.text}
                </Text>
              </View>
            )
          default:
            return null
        }
      })}
    </View>
  )
}