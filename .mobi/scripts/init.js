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
  console.log('       墨笔-OS (InkBrush-OS) 小说脚手架初始化向导       ');
  console.log('======================================================\n');
  console.log('提示：您可以直接按回车以选择默认推荐值。\n');

  try {
    // 1. 获取用户输入
    const nameInput = await askQuestion('✍️ 请输入小说书名 (默认: 灵气复苏的低调剑仙): ');
    const novelName = nameInput.trim() || '灵气复苏的低调剑仙';

    const authorInput = await askQuestion('✒️ 请输入作者笔名 (默认: 天码笔仙): ');
    const author = authorInput.trim() || '天码笔仙';

    console.log('\n📚 请选择小说题材流派:');
    console.log('  1. cultivation - 修真玄幻 (硬核战斗, 仙侠意境)');
    console.log('  2. urban       - 都市爽文 (商战豪门, 装逼打脸)');
    console.log('  3. scifi       - 科幻悬疑 (冰冷质感, 硬核逻辑, 悬疑恐怖)');
    console.log('  4. romance     - 言情轻小说 (日常灵动, 细腻情感拉扯)');
    const genreInput = await askQuestion('👉 请输入序号或拼写 (默认: cultivation): ');
    let genre = 'cultivation';
    if (genreInput.trim() === '2' || genreInput.trim().toLowerCase() === 'urban') genre = 'urban';
    else if (genreInput.trim() === '3' || genreInput.trim().toLowerCase() === 'scifi') genre = 'scifi';
    else if (genreInput.trim() === '4' || genreInput.trim().toLowerCase() === 'romance') genre = 'romance';

    const styleInput = await askQuestion('\n🎭 请输入文风基调简述 (回车使用通用配置): ');
    const toneStyle = styleInput.trim() || '文风沉稳，细节丰富，人物智商在线，叙事干净利落，拒绝无意义灌水。';

    console.log('\n------------------------------------------------------');
    console.log('正在为您构建专属创作空间，请稍候...');

    // 2. 文件夹创建
    const directories = [
      '设定集/人物卡',
      '设定集/势力与地理',
      '大纲集/第一卷_微末崛起',
      '正文草稿/第一卷_微末崛起',
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

    // 4. 初始化 伏笔线索库.json
    const cluePath = path.join(process.cwd(), '.mobi', '伏笔线索库.json');
    if (!fs.existsSync(path.dirname(cluePath))) {
      fs.mkdirSync(path.dirname(cluePath), { recursive: true });
    }
    const clueData = {
      clues: [
        {
          id: "clue_01_mysterious_token",
          name: "主角身上的神秘黑铁牌",
          status: "未激活",
          chapter_introduced: 1,
          description: "主角下山前师父留给他的铁牌，通体冰冷，上面刻有模糊的符文，似乎与太玄门拙峰有某种共鸣。"
        }
      ]
    };
    fs.writeFileSync(cluePath, JSON.stringify(clueData, null, 2), 'utf-8');
    console.log('✅ 初始化伏笔与线索数据库');

    // 5. 初始化 小说总纲.md (带 Mermaid)
    const outlinePath = path.join(process.cwd(), '小说总纲.md');
    let mermaidTemplate = `
\`\`\`mermaid
graph TD
    A[第一卷: 微末崛起] --> B[第二卷: 声名鹊起]
    B --> C[第三卷: 名震东荒]
    
    subgraph 人物核心冲突
        主角[主角叶凌] --- 盟友[师姐苏清影]
        主角 -.->|敌对| 反派[韩执事]
    end
\`\`\`
`;
    const outlineContent = `# 《${novelName}》小说总大纲

## Ⅰ. 核心风格与流派基调
* **题材流派**：${genre} (${genre === 'cultivation' ? '修真玄幻' : genre === 'urban' ? '都市爽文' : genre === 'scifi' ? '科幻悬疑' : '言情轻小说'})
* **笔名作者**：${author}
* **文风基调**：${toneStyle}

## Ⅱ. 世界观与势力网
${mermaidTemplate}

## Ⅲ. 主线核心矛盾与终极追求
* **核心冲突**：(例：末法时代灵气衰微，大门派垄断资源。主角凭借神秘铁牌，低调逆袭，抗衡垄断势力。)
* **主角终极追求**：(例：解开师尊失踪之谜，重塑天地秩序，踏入神道。)

## Ⅳ. 境界等级体系规划
* **境界规划**：(例：练气期 -> 筑基期 -> 金丹期 -> 元婴期 -> 化神期)
* **战力界限约束**：每一境界差距犹如鸿沟，绝对严禁越级秒杀，突出招式妙用与法宝克制。
`;
    fs.writeFileSync(outlinePath, outlineContent, 'utf-8');
    console.log('✅ 生成小说总纲: 小说总纲.md');

    // 6. 从模板生成 主角人物卡.md
    const charTemplatePath = path.join(process.cwd(), '.mobi/templates/character_card.md');
    const protagonistPath = path.join(process.cwd(), '设定集/人物卡/主角_叶凌.md');
    if (fs.existsSync(charTemplatePath)) {
      let charContent = fs.readFileSync(charTemplatePath, 'utf-8');
      charContent = charContent
        .replace('name: "角色姓名"', 'name: "叶凌"')
        .replace('alias: "外号/尊称/曾用名"', 'alias: "无名仙客"')
        .replace('age: "表面年龄/真实年龄"', 'age: "18岁"')
        .replace('identity: "核心身份（如：太玄门废柴杂役、姬家小公主）"', 'identity: "太玄门拙峰废柴杂役弟子"')
        .replace('power_level: "当前境界/能力等级"', 'power_level: "练气一层"')
        .replace('relationships: { "主角": "敌对/盟友/红颜/师徒", "配角A": "死敌" }', 'relationships: { "苏清影": "盟友/师姐", "韩执事": "敌对" }');
      fs.writeFileSync(protagonistPath, charContent, 'utf-8');
      console.log('✅ 生成主角人设卡: 设定集/人物卡/主角_叶凌.md');
    }

    // 7. 初始化第一章细纲与正文占位符
    const sceneTemplatePath = path.join(process.cwd(), '.mobi/templates/scene_card.md');
    const chOutlinePath = path.join(process.cwd(), '大纲集/第一卷_微末崛起/第001章_细纲.md');
    const chDraftPath = path.join(process.cwd(), '正文草稿/第一卷_微末崛起/第001章_正文.md');

    if (fs.existsSync(sceneTemplatePath)) {
      let sceneContent = fs.readFileSync(sceneTemplatePath, 'utf-8');
      sceneContent = sceneContent
        .replace('chapter_title: "章节名称（如：拙峰复苏，神迹显现）"', 'chapter_title: "下山试剑，神秘铁牌"')
        .replace('active_characters: [角色A, 角色B]', 'active_characters: [叶凌, 韩执事]')
        .replace('clues_advanced: [clue_01_神秘残片]', 'clues_advanced: [clue_01_mysterious_token]');
      fs.writeFileSync(chOutlinePath, sceneContent, 'utf-8');
      console.log('✅ 生成第一章细纲: 大纲集/第一卷_微末崛起/第001章_细纲.md');
    }

    const draftContent = `---
title: "第一章 下山试剑，神秘铁牌"
volume: "第一卷_微末崛起"
characters: [主角_叶凌]
factions: [太玄门]
rules: [世界法则与境界]
scene_outline: "../../大纲集/第一卷_微末崛起/第001章_细纲.md"
clues: [clue_01_mysterious_token]
---

# 第一章 下山试剑，神秘铁牌

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
    console.log('✅ 生成第一章正文骨架: 正文草稿/第一卷_微末崛起/第001章_正文.md');

    console.log('\n🎉======================================================🎉');
    console.log('       恭喜！《' + novelName + '》开发脚手架部署成功！       ');
    console.log('       您现在可以直接提交 Git，开启您的伟大创作！        ');
    console.log('🎉======================================================🎉\n');

  } catch (err) {
    console.error('❌ 初始化失败:', err);
  } finally {
    rl.close();
  }
}

main();
