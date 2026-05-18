const fs = require('fs');
const path = require('path');

function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (file.endsWith('.md') && !file.startsWith('_')) {
      results.push(fullPath);
    }
  });
  return results;
}

function countChineseWords(text) {
  if (!text) return 0;
  const ch = text.match(/[\u4e00-\u9fa5]/g);
  const eng = text.match(/[a-zA-Z0-9]+/g);
  let total = 0;
  if (ch) total += ch.length;
  if (eng) total += eng.length;
  return total;
}

// 解析 Markdown 文件的 Front Matter
function parseFrontMatter(content) {
  const metadata = {};
  const parts = content.split('---');
  if (parts.length >= 3) {
    const yaml = parts[1].trim();
    const lines = yaml.split('\n');
    lines.forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex !== -1) {
        const key = line.substring(0, separatorIndex).trim();
        let value = line.substring(separatorIndex + 1).trim();
        
        // 解析简易的数组，如 [叶凡, 韩长老]
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
        } else {
          value = value.replace(/['"]/g, '');
        }
        metadata[key] = value;
      }
    });
  }
  return metadata;
}

function main() {
  console.log('\n======================================================');
  console.log('       墨笔-OS (InkBrush-OS) 小说静态指标分析工具       ');
  console.log('======================================================\n');

  const rootDir = process.cwd();
  
  // 1. 全局字数统计
  const draftDir = path.join(rootDir, '正文草稿');
  const draftFiles = getMarkdownFiles(draftDir);
  let totalWords = 0;
  let chapterCount = 0;
  
  // 用于统计角色登场频率
  const characterAppearances = {};

  draftFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const words = countChineseWords(content);
    totalWords += words;
    chapterCount++;

    const meta = parseFrontMatter(content);
    if (meta.characters && Array.isArray(meta.characters)) {
      meta.characters.forEach(char => {
        characterAppearances[char] = (characterAppearances[char] || 0) + 1;
      });
    }
  });

  console.log('📈 【核心字数指标】');
  console.log(`  - 创作进度: 已完成正文 ${chapterCount} 章节`);
  console.log(`  - 总字数量: ${totalWords.toLocaleString()} 字`);
  console.log(`  - 均章字数: ${chapterCount > 0 ? Math.round(totalWords / chapterCount) : 0} 字/章`);
  console.log('------------------------------------------------------');

  // 2. 人物卡统计与活跃角色排行
  const charDir = path.join(rootDir, '设定集/人物卡');
  const charFiles = getMarkdownFiles(charDir);
  console.log('👥 【人设数据库指标】');
  console.log(`  - 人物库总角色数: ${charFiles.length} 名`);
  
  const charactersList = [];
  charFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const meta = parseFrontMatter(content);
    const name = meta.name || path.basename(file, '.md');
    charactersList.push({
      name: name,
      level: meta.power_level || '未知/凡人',
      status: meta.status || '正常'
    });
  });

  charactersList.forEach(char => {
    const appCount = characterAppearances[char.name] || 0;
    console.log(`  - [${char.name}] (${char.level}) -> 状态: ${char.status} | 章节登场频次: ${appCount}次`);
  });
  console.log('------------------------------------------------------');

  // 3. 伏笔与线索矩阵分析
  const clueFilePath = path.join(rootDir, '.mobi/伏笔线索库.json');
  if (fs.existsSync(clueFilePath)) {
    console.log('🕸️  【伏笔与线索矩阵追踪】');
    try {
      const clueDb = JSON.parse(fs.readFileSync(clueFilePath, 'utf-8'));
      const clues = clueDb.clues || [];
      
      const stats = { '未激活': 0, '已激活': 0, '已收回/完成': 0 };
      clues.forEach(clue => {
        stats[clue.status] = (stats[clue.status] || 0) + 1;
      });

      console.log(`  - 伏笔池总线索: ${clues.length} 条`);
      console.log(`  - 🟢 已收回线索: ${stats['已收回/完成'] || 0} 条`);
      console.log(`  - 🟡 活跃已激活线索: ${stats['已激活'] || 0} 条`);
      console.log(`  - ⚪ 未激活待铺垫线索: ${stats['未激活'] || 0} 条`);
      console.log('\n  详细伏笔清单:');
      clues.forEach(clue => {
        let statusSymbol = '⚪';
        if (clue.status === '已激活') statusSymbol = '🟡';
        else if (clue.status === '已收回/完成') statusSymbol = '🟢';
        console.log(`    ${statusSymbol} [${clue.id}] ${clue.name} -> 状态: ${clue.status} (第 ${clue.chapter_introduced} 章引入)`);
        console.log(`       └ 描述: ${clue.description}`);
      });

    } catch (e) {
      console.error('  ❌ 伏笔线索库.json 解析失败。');
    }
  } else {
    console.log('⚪ 【伏笔与线索矩阵】未初始化，请运行 `npm run init`。');
  }
  console.log('======================================================\n');
}

main();
