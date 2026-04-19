import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error: error?.message || String(error) }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="empty" style={{ color: '#c0392b' }}>
          <div className="empty-icon">⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>组件渲染出错</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', background: '#fff5f5',
                        padding: '8px 12px', borderRadius: 4, maxWidth: 500, wordBreak: 'break-all' }}>
            {this.state.error}
          </div>
          <button
            style={{ marginTop: 12, padding: '6px 16px', border: '1px solid #c0392b',
                     borderRadius: 4, background: 'white', cursor: 'pointer', color: '#c0392b' }}
            onClick={() => this.setState({ error: null })}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
