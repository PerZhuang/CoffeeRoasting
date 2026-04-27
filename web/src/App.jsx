import React, { useEffect, useState } from 'react'
import HomePage     from './pages/HomePage.jsx'
import BeanPage     from './pages/BeanPage.jsx'
import LibraryPage  from './pages/LibraryPage.jsx'
import RoastsPage   from './pages/RoastsPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import CuppingPage  from './pages/CuppingPage.jsx'
import { loadManifest, loadRoastLog } from './utils/dataLoader.js'

/* 豆种静态定义 — 新增豆种时在此追加
 *
 * cuppingFilter / analysisFilter: (filename: string) => boolean
 *   精确控制哪些文件属于该豆种，避免多豆种数据混淆
 *   文件名不含扩展名，例如 "cupping_007_yunnan_v1"
 */
const BEANS = [
  {
    id:          'yunnan_puer_catimor_nat',
    name:        '云南普洱卡蒂姆',
    variety:     'Catimor',
    process:     '日晒',
    altitude:    '1650m',
    filterKey:   'Catimor',
    cardFile:    'yunnan_puer_catimor_nat',
    klogOffset:  69,
    cuppingFilter:  f => f.includes('yunnan'),
    analysisFilter: f => /log00(7[7-9]|8[0-3])/.test(f),
  },
  {
    id:          'panama_aurora_catuai_nat',
    name:        '巴拿马极光卡杜艾',
    variety:     'Catuai',
    process:     '日晒',
    altitude:    '1525–1600m',
    filterKey:   'Catuai',
    cardFile:    'panama_aurora_catuai_nat',
    klogOffset:  69,
    cuppingFilter:  f => !f.includes('yunnan'),
    analysisFilter: f => /log007[2-6]/.test(f),
  },
  {
    id:          'colombia_huila_chiloso_washed',
    name:        '哥伦比亚惠兰奇洛索',
    variety:     'Chiloso',
    process:     '水洗',
    altitude:    '1800–1900m',
    filterKey:   'Chiloso',
    cardFile:    'colombia_huila_chiloso_washed',
    klogOffset:  76,
    // 杯测：含 'chiloso' 的文件（cupping_023_col_chiloso_v1, cupping_025_col_chiloso_v3）
    cuppingFilter:  f => f.includes('chiloso'),
    // 分析：log0099–log0101（Colombia roast_ids 23–25，offset 76）
    analysisFilter: f => /col.*chilo/i.test(f),
  },
  {
    id:          'ethiopia_hambela_washed',
    name:        '埃塞俄比亚罕贝拉',
    variety:     'Heirloom',
    process:     '水洗',
    altitude:    '1900–2300m',
    filterKey:   'Hambela',
    cardFile:    'ethiopia_hambela_washed',
    klogOffset:  76,
    cuppingFilter:  f => /eth|hambela/i.test(f),
    analysisFilter: f => /log009/.test(f),
  },
]

export default function App() {
  const [manifest, setManifest] = useState(null)
  const [roasts, setRoasts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState('home')
  const [currentBeanId, setCurrentBeanId] = useState(null)
  const [prevPage, setPrevPage] = useState('home')

  useEffect(() => {
    Promise.all([loadManifest(), loadRoastLog()])
      .then(([mf, rows]) => { setManifest(mf); setRoasts(rows); setLoading(false) })
      .catch(e => { console.error(e); setLoading(false) })
  }, [])

  const handleSelectBean = (beanId) => {
    setPrevPage(page)
    setCurrentBeanId(beanId)
    setPage('bean')
  }

  const handleNavigate = (p) => {
    setPage(p)
  }

  const handleBack = () => {
    setPage(prevPage === 'bean' ? 'library' : prevPage)
    setCurrentBeanId(null)
  }

  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', height:'100vh', background:'var(--bg)',
                    color:'var(--text3)', gap:16 }}>
        {/* 高黎贡山 + 怒江 */}
        <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
          <path d="M1 27 L10 4 L16.5 14 L22.5 6 L27 27 Z" fill="#ffffff"/>
          <line x1="1" y1="20" x2="27" y2="20" stroke="#1ed760" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="1" y1="24" x2="27" y2="24" stroke="#1ed760" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize:13, letterSpacing:'.18em', fontFamily:"'Josefin Sans', sans-serif", fontWeight:700 }}>GAURI</span>
      </div>
    )
  }

  if (page === 'home') {
    return (
      <HomePage
        roasts={roasts}
        beans={BEANS}
        page={page}
        onNavigate={handleNavigate}
        onSelectBean={handleSelectBean}
      />
    )
  }

  if (page === 'library') {
    return (
      <LibraryPage
        roasts={roasts}
        beans={BEANS}
        page={page}
        onNavigate={handleNavigate}
        onSelectBean={handleSelectBean}
      />
    )
  }

  if (page === 'roasts') {
    return (
      <RoastsPage
        roasts={roasts}
        beans={BEANS}
        page={page}
        onNavigate={handleNavigate}
        onSelectBean={handleSelectBean}
      />
    )
  }

  if (page === 'insights') {
    return (
      <InsightsPage
        roasts={roasts}
        beans={BEANS}
        page={page}
        onNavigate={handleNavigate}
        onSelectBean={handleSelectBean}
      />
    )
  }

  if (page === 'cupping') {
    return (
      <CuppingPage
        roasts={roasts}
        beans={BEANS}
        manifest={manifest}
        page={page}
        onNavigate={handleNavigate}
      />
    )
  }

  // Bean detail page
  const bean = BEANS.find(b => b.id === currentBeanId)
  if (!bean) return null

  const beanRoasts = roasts.filter(r =>
    r.green_bean?.toLowerCase().includes(bean.filterKey.toLowerCase())
  )

  const allKlogs = manifest?.klogs ?? []
  const beanKlogSet = new Set(
    beanRoasts.map(r => `log${String(parseInt(r.roast_id) + bean.klogOffset).padStart(4, '0')}`)
  )
  const beanKlogs = allKlogs.filter(k => beanKlogSet.has(k))

  const cuppingFiles = bean.cuppingFilter
    ? (manifest?.cupping ?? []).filter(bean.cuppingFilter)
    : []

  const analysisFiles = bean.analysisFilter
    ? (manifest?.analysis ?? []).filter(bean.analysisFilter)
    : []

  return (
    <BeanPage
      beanId={bean.id}
      beanName={bean.name}
      beanCardFile={bean.cardFile}
      variety={bean.variety}
      process={bean.process}
      altitude={bean.altitude}
      klogOffset={bean.klogOffset}
      roasts={beanRoasts}
      klogs={beanKlogs}
      cuppingFiles={cuppingFiles}
      analysisFiles={analysisFiles}
      onBack={handleBack}
    />
  )
}
