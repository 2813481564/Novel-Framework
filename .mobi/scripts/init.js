const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n======================================================');
  console.log('    墨笔-OS (InkBrush-OS) 万能AI小说脚手架初始化向导    ');
  console.log('======================================================\n');
  console.log('提示：您可以直接按回车以选择默认推荐值。\n');

  try {
    // 1. 获取基本小说配置
    const nameInput = await askQuestion('✍️ 请输入小说书名 (默认: 灵气复苏的低调剑仙): ');
    const novelName = nameInput.trim() || '灵气复苏的低调剑仙';

    const authorInput = await askQuestion('✒️ 请输入作者笔名 (默认: 天码笔仙): ');
    const author = authorInput.trim() || '天码笔仙';

    console.log('\n📚 请选择小说题材流派:');
    console.log('  1. cultivation - 修真玄幻 (硬核战斗, 仙侠意境)');
    console.log('  2. urban       - 都市爽文 (商战豪门, 装逼打脸)');
    console.log('  3. scifi       - 科幻悬疑 (冰冷质感, 硬核逻辑, 悬疑恐怖)');
    console.log('  4. romance     - 言情轻小说 (日常灵动, 细腻情感拉扯)');
    console.log('  5. custom      - 自定义题材 (自由发挥)');
    const genreInput = await askQuestion('👉 请输入序号或拼写 (默认: cultivation): ');
    
    let genre = 'cultivation';
    let genreChinese = '修真玄幻';
    if (genreInput.trim() === '2' || genreInput.trim().toLowerCase() === 'urban') {
      genre = 'urban';
      genreChinese = '都市爽文';
    } else if (genreInput.trim() === '3' || genreInput.trim().toLowerCase() === 'scifi') {
      genre = 'scifi';
      genreChinese = '科幻悬疑';
    } else if (genreInput.trim() === '4' || genreInput.trim().toLowerCase() === 'romance') {
      genre = 'romance';
      genreChinese = '言情轻小说';
    } else if (genreInput.trim() === '5' || genreInput.trim().toLowerCase() === 'custom') {
      genre = 'custom';
      genreChinese = '自定义题材';
    }

    const defaultProtagonist = genre === 'cultivation' ? '叶凌' : genre === 'urban' ? '陆寒' : genre === 'scifi' ? '顾星澜' : genre === 'romance' ? '苏晴' : '主角';
    const protInput = await askQuestion(`👤 请输入主角姓名 (默认: ${defaultProtagonist}): `);
    const protagonistName = protInput.trim() || defaultProtagonist;

    const defaultAntagonist = genre === 'cultivation' ? '韩执事' : genre === 'urban' ? '李少' : genre === 'scifi' ? '陈主管' : genre === 'romance' ? '林傲' : '反派';
    const antInput = await askQuestion(`👿 请输入主要敌对/反派姓名 (默认: ${defaultAntagonist}): `);
    const antagonistName = antInput.trim() || defaultAntagonist;

    const defaultClue = genre === 'cultivation' ? '神秘黑铁牌' : genre === 'urban' ? '至尊黑卡' : genre === 'scifi' ? '古怪的纳米芯片' : genre === 'romance' ? '定情玉佩' : '神秘遗物';
    const clueInput = await askQuestion(`🕸️ 请输入核心线索/伏笔名称 (默认: ${defaultClue}): `);
    const coreClueName = clueInput.trim() || defaultClue;

    const defaultVolume = '第一卷_微末崛起';
    const volumeInput = await askQuestion(`📂 请输入第一卷分卷名称 (默认: ${defaultVolume}): `);
    const volumeName = volumeInput.trim() || defaultVolume;

    const styleInput = await askQuestion('\n🎭 请输入文风基调简述 (回车使用默认硬核基调): ');
    const toneStyle = styleInput.trim() || '文风沉稳，细节丰富，人物智商在线，叙事干净利落，拒绝无意义灌水。';

    console.log('\n------------------------------------------------------');
    console.log('正在为您构建万能创作空间，请稍候...');

    // 2. 动态目录生成
    const directories = [
      '设定集/人物卡',
      '设定集/势力与地理',
      `大纲集/${volumeName}`,
      `正文草稿/${volumeName}`,
      'dist'
    ];

    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ 创建目录: ${dir}`);
      }
    });

    // 3. 生成全局配置文件 config.json
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = {
      novel_name: novelName,
      author: author,
      genre: genre,
      target_words: 1000000,
      tone_style: toneStyle,
      ai_writing_rules: {
        words_per_scene_min: 1000,
        words_per_scene_max: 1500,
        enable_self_check: true,
        language: "zh"
      },
      compiler_options: {
        output_file: `dist/精编定稿_${novelName}.txt`,
        include_volume_headers: true,
        strip_html_comments: true,
        strip_front_matter: true
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('✅ 生成配置文件: config.json');

    // 4. 自适应伏笔与线索库生成
    const cluePath = path.join(process.cwd(), '.mobi', '伏笔线索库.json');
    if (!fs.existsSync(path.dirname(cluePath))) {
      fs.mkdirSync(path.dirname(cluePath), { recursive: true });
    }
    const clueData = {
      clues: [
        {
          id: "clue_01_core_relic",
          name: coreClueName,
          status: "未激活",
          chapter_introduced: 1,
          description: `主角身上的${coreClueName}，来历神秘，刻有晦涩奇异的图纹，隐约有着惊人的波动。`
        }
      ]
    };
    fs.writeFileSync(cluePath, JSON.stringify(clueData, null, 2), 'utf-8');
    console.log(`✅ 生成伏笔与线索数据库 (注入线索: ${coreClueName})`);

    // 5. 动态境界系统与总纲生成
    let boundarySystem = '';
    if (genre === 'cultivation') {
      boundarySystem = '练气期 -> 筑基期 -> 金丹期 -> 元婴期 -> 化神期';
    } else if (genre === 'urban') {
      boundarySystem = '普通人 -> 龙虎保镖 -> 抱丹宗师 -> 绝世战神 -> 陆地神仙';
    } else if (genre === 'scifi') {
      boundarySystem = '未强化人 -> 基因破限者 -> 纳米改造者 -> 星海执政官';
    } else if (genre === 'romance') {
      boundarySystem = '初识 -> 暧昧 -> 倾心 -> 相濡以沫';
    } else {
      boundarySystem = '未定义 (请在此处定义您的力量层级)';
    }

    const outlinePath = path.join(process.cwd(), '小说总纲.md');
    const outlineContent = `# 《${novelName}》小说总大纲

## Ⅰ. 核心风格与流派基调
* **题材流派**：${genre} (${genreChinese})
* **笔名作者**：${author}
* **文风基调**：${toneStyle}

## Ⅱ. 世界观与势力网

\`\`\`mermaid
graph TD
    A[${volumeName}] --> B[第二卷: 斩露头角]
    B --> C[第三卷: 名震八荒]
    
    subgraph 人物核心冲突
        主角[主角:${protagonistName}] --- 盟友[师门/挚友]
        主角 -.->|敌对| 反派[反派:${antagonistName}]
    end
\`\`\`

## Ⅲ. 主线核心矛盾与终极追求
* **核心冲突**：主角携带「${coreClueName}」，在「${antagonistName}」等各方反派势力的围剿与陷阱下低调发育，利用智慧与力量反客为主。
* **主角终极追求**：解开自身身世之谜，超脱宿命，踏足巅峰。

## Ⅳ. 境界等级体系规划
* **境界规划**：${boundarySystem}
* **战力界限约束**：每一境界差距犹如鸿沟，严禁无脑秒杀，突出智商在线、逻辑严密、以弱胜强的多维战术博弈。
`;
    fs.writeFileSync(outlinePath, outlineContent, 'utf-8');
    console.log('✅ 生成流派总纲: 小说总纲.md');

    // 6. 动态生成主角人设卡
    const charTemplatePath = path.join(process.cwd(), '.mobi/templates/character_card.md');
    const protagonistPath = path.join(process.cwd(), '设定集/人物卡', `主角_${protagonistName}.md`);
    if (fs.existsSync(charTemplatePath)) {
      let charContent = fs.readFileSync(charTemplatePath, 'utf-8');
      
      const startRealm = genre === 'cultivation' ? '练气一层' : genre === 'urban' ? '普通人' : genre === 'scifi' ? '未强化' : '初识';
      const identityDesc = genre === 'cultivation' ? '底层废柴杂役弟子' : genre === 'urban' ? '落魄家族弃子' : genre === 'scifi' ? '底层的三等星区平民' : '普通人';

      charContent = charContent
        .replace(/"角色姓名"/g, `"${protagonistName}"`)
        .replace(/"外号\/尊称\/曾用名"/g, `"${protagonistName}"`)
        .replace(/"表面年龄\/真实年龄"/g, '"18岁"')
        .replace(/"核心身份（如：太玄门废柴杂役、姬家小公主）"/g, `"${identityDesc}"`)
        .replace(/"所属势力"/g, '"无"')
        .replace(/"存活\/受伤\/失踪"/g, '"存活"')
        .replace(/"当前境界\/能力等级"/g, `"${startRealm}"`)
        .replace(/{ "主角": "敌对\/盟友\/红颜\/师徒", "配角A": "死敌" }/g, `{ "反派": "敌对", "${antagonistName}": "暗地敌对" }`)
        .replace(/\(例：常穿一袭洗得发白的青色道袍，身材略显消瘦，眼神清澈而深邃，腰间挂着一块普通黑铁牌\)/g, `常穿朴素衣装，神情平静冷静，腰间贴肉收置着神秘的「${coreClueName}」`)
        .replace(/\(例：冷静克制、极度务实、不喜多言。行事谋定后动，绝不强出头，但一旦出手便斩草除根\)/g, `极度冷静克制、极度务实。行事走一步算十步，谋定后动，善于示弱，一旦出手斩草除根`)
        .replace(/\(例：思考时喜欢轻轻摩挲右手无名指；与人交谈时惯常微微敛眸\)/g, `沉思时手指轻敲，惯于敛眸掩饰神情`)
        .replace(/\(阐述该人物是如何来到当前时间节点的，受过什么创伤或有哪些辉煌过去\)/g, `自底层成长，身世如谜，携神秘的「${coreClueName}」前行`)
        .replace(/\(支撑该角色在这个世界上生存与冒险的最深层渴望，如：重铸家族荣光、追寻长生之秘\)/g, `探寻真相，摆脱被执棋者摆布的命运`);

      fs.writeFileSync(protagonistPath, charContent, 'utf-8');
      console.log(`✅ 生成主角人设卡: 设定集/人物卡/主角_${protagonistName}.md`);
    }

    // 7. 生成细纲与正文骨架
    const sceneTemplatePath = path.join(process.cwd(), '.mobi/templates/scene_card.md');
    const chOutlinePath = path.join(process.cwd(), '大纲集', volumeName, '第001章_细纲.md');
    const chDraftPath = path.join(process.cwd(), '正文草稿', volumeName, '第001章_正文.md');

    if (fs.existsSync(sceneTemplatePath)) {
      let sceneContent = fs.readFileSync(sceneTemplatePath, 'utf-8');
      sceneContent = sceneContent
        .replace(/"章节名称（如：拙峰复苏，神迹显现）"/g, '"初入樊笼，宿命重逢"')
        .replace(/\[角色A, 角色B\]/g, `[${protagonistName}, ${antagonistName}]`)
        .replace(/\[clue_01_神秘残片\]/g, '[clue_01_core_relic]')
        .replace(/\* \*\*场景一定位\*\*：(.*?)\n/g, '* **场景一定位**：危机四伏的开局之地\n')
        .replace(/\* \*\*场景二定位\*\*：(.*?)\n/g, `* **场景二定位**：利用「${coreClueName}」暗中破局，境界突破\n`)
        .replace(/\* \*\*场景三定位\*\*：(.*?)\n/g, `* **场景三定位**：与反派「${antagonistName}」的首次正面言语交锋，智商拉满\n`);
      fs.writeFileSync(chOutlinePath, sceneContent, 'utf-8');
      console.log(`✅ 生成第一章细纲: 大纲集/${volumeName}/第001章_细纲.md`);
    }

    const draftContent = `---
title: "第一章 初入樊笼，宿命重逢"
volume: "${volumeName}"
characters: [主角_${protagonistName}]
factions: [未知]
rules: [世界法则]
scene_outline: "../../大纲集/${volumeName}/第001章_细纲.md"
clues: [clue_01_core_relic]
---

# 第一章 初入樊笼，宿命重逢

<!-- SCENE 1 START -->
[AI待生成：请点击聊天框，指令我读取左侧细纲，开始执笔撰写本章第一幕正文。]
<!-- SCENE 1 END -->

<!-- SCENE 2 START -->
[AI待生成：第二幕正文]
<!-- SCENE 2 END -->

<!-- SCENE 3 START -->
[AI待生成：第三幕正文]
<!-- SCENE 3 END -->
`;
    fs.writeFileSync(chDraftPath, draftContent, 'utf-8');
    console.log(`✅ 生成第一章正文骨架: 正文草稿/${volumeName}/第001章_正文.md`);

    console.log('\n🎉======================================================🎉');
    console.log('       恭喜！万能脚手架初始化成功！                     ');
    console.log('       您可以开始运行 `npm run preview` 或开始写作。    ');
    console.log('🎉======================================================🎉\n');

  } catch (err) {
    console.error('❌ 初始化失败:', err);
  } finally {
    rl.close();
  }
}

main();
