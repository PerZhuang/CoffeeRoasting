import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownPanel({ loader, placeholder = '请选择文件' }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loader) { setContent(null); return }
    setLoading(true)
    loader()
      .then(text => { setContent(text); setLoading(false) })
      .catch(() => { setContent('❌ 文件加载失败'); setLoading(false) })
  }, [loader])

  if (!loader)
    return <div className="empty"><div className="empty-icon">📄</div>{placeholder}</div>
  if (loading)
    return <div className="loading">加载中…</div>

  return (
    <div className="card">
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
      </div>
    </div>
  )
}
