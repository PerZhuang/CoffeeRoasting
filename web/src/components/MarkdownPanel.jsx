import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * src: 相对 /data/ 的路径，如 "01_green_beans/yunnan_puer_catimor_nat.md"
 */
export default function MarkdownPanel({ src, placeholder = '请选择文件' }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!src) { setContent(null); return }
    setLoading(true)
    fetch(`/data/${src}`)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(text => { setContent(text); setLoading(false) })
      .catch(err => { setContent(`❌ 文件加载失败 (${err})`); setLoading(false) })
  }, [src])

  if (!src)
    return <div className="empty"><div className="empty-icon">📄</div>{placeholder}</div>
  if (loading)
    return <div className="loading">加载中…</div>

  return (
    <div className="md-wrap">
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
      </div>
    </div>
  )
}
