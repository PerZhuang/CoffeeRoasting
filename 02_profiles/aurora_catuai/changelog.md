# Aurora Catuai Natural Panama — 配置变更日志

## V6 (2026-03-08) — 待测试
**文件：** `Catuai_Natural_Panama_Filter_v6.kpro`
**基础：** V5（迄今最佳结果）
**变更：**
- 曲线中段斜率降低17%：170→197°C 从 95s 延长至 115s（减少ROR过冲）
- Kd: 3.55 → 3.10（抑制振荡）
- 曲线终点延长：380s/202°C → 400s/205°C（增加发展窗口）
- preheat_power: 820 → 830（补偿低环境温度）
- expect_fc: 197 → 195（匹配实测FC温度）
- roast_levels: 整体+2°C（200-212°C），Level 2.0=204°C
- 安全参数不变：无zone boost，end_ratio=0.75，min_ROR=0.2
**目标：** 发展比 19-22%（V5为17.1%），消除ROR转负，增加body同时保持花果香

## V5 (2026-03-07) — ✅ 迄今最佳
**文件：** `Catuai_Natural_Panama_Filter_v5.kpro`
**基础：** V3 曲线不变，仅调整冷却参数（cooldown_hi=17000, lo_temp=90°C）
**结果：** log0074 — 出豆204.4°C/6:44，FC ~195°C/5:35，发展比17.1%（首次达标）
**杯测：** 花果香明显，口感单薄
**问题：** ROR 两次转负（188°C/-2.13, 201°C/-4.09），出豆前停滞-冲刺模式
**下一步：** V6 放缓中段斜率 + Kd→3.0-3.2 + 提高 roast_levels，目标 dev 19-22%

## ReRoast DarkSOE (2026-03-07)
**文件：** `Catuai_Natural_Panama_ReRoast_DarkSOE.kpro`
**用途：** 二次烘焙抢救 log0073 (V4失败) 的110g欠发展豆，目标深烘SOE
**基础：** V3 安全参数
**关键设定：**
- reference_load_size: 110g（匹配实际投豆量）
- preheat_power: 770W（降低，防止已脱水豆表面焦化）
- expect_fc: 190°C（二次烘焙FC可能偏早）
- roast_levels: 208-220°C（深烘SOE档位）
- recommended_level: 2.0 = 212°C
- fan_profile: 全程降低至14500 RPM（补偿较少豆量）
- 曲线：脱水段缩短至180s/168°C，一爆后推进至214°C
- zone boost: 全部为0（吸取V4教训）
- 安全参数不变：end_ratio=0.75, min_ROR=0.2

## V4 (2026-03-05) — ⚠️ 失败
**文件：** `Catuai_Natural_Panama_Filter_v4.kpro`
**结果：** 烘焙失败，豆子严重欠发展（失重仅8.3%，无一爆）
**根因：** zone boost 负值(-1.0/-1.5)在关键阶段削减热量；end_ratio=0.6过低；min_ROR=0.1禁用安全检测
**教训：** 不要使用负值zone boost；不要同时修改多个安全参数

## V3 (2026-03-04)
**文件：** `Catuai_Natural_Panama_Filter_v3.kpro`
**变更：** preheat 800→820，曲线中段更陡以增加热惯量，一爆后斜率加快
**结果：** 未实际烘焙测试（跳过直接到V4）

## V2 (2026-03-03)
**文件：** `Catuai_Natural_Panama_Filter_v2.kpro`
**变更：** expect_fc 206→198，roast_levels 整体下调约10°C，曲线后段调整
**结果：** log0072 — 出豆205.3°C，FC ~195°C/6:10，发展比29.5%。ROR振荡从V1的9.5降至5.3（改善44%）。但发展期仍偏长，总时间8:44偏长。

## V1 (2026-03-03)
**文件：** `AmourCatuai.kpro`（初始配置）
**结果：** log0070/log0071 — 出豆~214°C，进入二爆，焦糖/可可/苦涩/烤烟感。发展过度。
