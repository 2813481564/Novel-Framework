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

function parseFrontMatterAndBody(content) {
  const metadata = {};
  let body = content;
  if (content.startsWith('---')) {
    const parts = content.split('---');
    if (parts.length >= 3) {
      body = parts.slice(2).join('---').trim();
      const yaml = parts[1].trim();
      const lines = yaml.split('\n');
      lines.forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const key = line.substring(0, separatorIndex).trim();
          let value = line.substring(separatorIndex + 1).trim();
          
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
          } else {
            value = value.replace(/['"]/g, '');
          }
          metadata[key] = value;
        }
      });
    }
  }
  return { metadata, body };
}

function main() {
  console.log('📊 [墨笔-OS] 正在构建本地可视化静态预览看板...');
  
  const rootDir = process.cwd();
  
  // 1. 获取全局配置
  const configPath = path.join(rootDir, 'config.json');
  let config = {
    novel_name: '未命名小说',
    author: '天码笔仙',
    genre: 'cultivation',
    target_words: 1000000
  };
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {}
  }

  // 2. 读取小说全局总纲
  let mainOutline = '暂无全局总纲，请在根目录下创建 [小说总纲.md]';
  const outlinePath = path.join(rootDir, '小说总纲.md');
  if (fs.existsSync(outlinePath)) {
    mainOutline = fs.readFileSync(outlinePath, 'utf-8');
  }

  // 3. 统计章节字数及进度
  const draftDir = path.join(rootDir, '正文草稿');
  const draftFiles = getMarkdownFiles(draftDir);
  let totalWords = 0;
  let totalChapters = 0;
  
  draftFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // 剔除注释计算真实字数
    const cleanContent = content.replace(/<!--[\s\S]*?-->/g, '').replace(/\[AI待生成:[\s\S]*?\]/g, '').trim();
    totalWords += countChineseWords(cleanContent);
    totalChapters++;
  });

  // 4. 读取人设库数据
  const charDir = path.join(rootDir, '设定集/人物卡');
  const charFiles = getMarkdownFiles(charDir);
  const characters = [];
  charFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const { metadata, body } = parseFrontMatterAndBody(content);
    // 抓取 Markdown 正文的第一部分作为角色简介描述
    const desc = body.replace(/#+[\s\S]*?\n/g, '').trim().substring(0, 300);
    characters.push({
      name: metadata.name || path.basename(file, '.md'),
      power_level: metadata.power_level || '凡人',
      identity: metadata.identity || '暂无',
      faction: metadata.faction || '散修',
      status: metadata.status || '正常',
      description: desc || body.substring(0, 200)
    });
  });

  // 5. 读取势力与地理数据
  const facDir = path.join(rootDir, '设定集/势力与地理');
  const facFiles = getMarkdownFiles(facDir);
  const factions = [];
  facFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const { metadata, body } = parseFrontMatterAndBody(content);
    const desc = body.replace(/#+[\s\S]*?\n/g, '').trim().substring(0, 300);
    factions.push({
      name: metadata.name || path.basename(file, '.md'),
      type: metadata.type || '地理/门派',
      leader: metadata.leader || '未知',
      location: metadata.location || '未知',
      tier: metadata.tier || '未知',
      description: desc || body.substring(0, 200)
    });
  });

  // 6. 读取伏笔线索库
  let clues = [];
  const cluePath = path.join(rootDir, '.mobi/伏笔线索库.json');
  if (fs.existsSync(cluePath)) {
    try {
      const clueData = JSON.parse(fs.readFileSync(cluePath, 'utf-8'));
      clues = clueData.clues || [];
    } catch(e) {}
  }

  // 7. 读取并解析大纲集章节细纲树
  const outlineDir = path.join(rootDir, '大纲集');
  const outlines = [];
  if (fs.existsSync(outlineDir)) {
    const volumes = fs.readdirSync(outlineDir).filter(f => fs.statSync(path.join(outlineDir, f)).isDirectory());
    volumes.sort();
    
    volumes.forEach(volName => {
      const volPath = path.join(outlineDir, volName);
      const chFiles = fs.readdirSync(volPath).filter(f => f.endsWith('.md') && !f.startsWith('卷大纲'));
      chFiles.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

      const chapters = [];
      chFiles.forEach(chFile => {
        const content = fs.readFileSync(path.join(volPath, chFile), 'utf-8');
        const { metadata, body } = parseFrontMatterAndBody(content);
        
        // 尝试抓取 “## 📖 本章核心剧情要旨” 下方的内容作为 summary
        let summary = '';
        const summaryHeader = '## 📖 本章核心剧情要旨';
        const index = body.indexOf(summaryHeader);
        if (index !== -1) {
          const rawSummary = body.substring(index + summaryHeader.length).trim();
          // 截取到下一个标题前
          const nextHeaderIndex = rawSummary.indexOf('\n##');
          summary = nextHeaderIndex !== -1 ? rawSummary.substring(0, nextHeaderIndex).trim() : rawSummary;
        } else {
          summary = body.substring(0, 150).trim();
        }

        chapters.push({
          chapter_title: metadata.chapter_title || chFile.replace('.md', ''),
          summary: summary
        });
      });

      outlines.push({
        volume_name: volName.replace(/_/g, ' '),
        chapters: chapters
      });
    });
  }

  // 8. 整合为打包 JSON 事实数据库
  const novelData = {
    config: config,
    main_outline: mainOutline,
    stats: {
      total_words: totalWords,
      total_chapters: totalChapters
    },
    characters: characters,
    factions: factions,
    clues: clues,
    outlines: outlines
  };

  // 9. 读取模板，注入数据，生成终极 html 看板
  const templatePath = path.join(rootDir, '.mobi/preview_template.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ 错误：未检测到 [.mobi/preview_template.html] 看板模板！');
    process.exit(1);
  }

  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // 字符串宏替换
  html = html.replace(/__NOVEL_NAME__/g, config.novel_name);
  html = html.replace(/__GENRE__/g, config.genre);
  html = html.replace(/__AUTHOR__/g, config.author);
  html = html.replace(/__WORDS__/g, `${(totalWords / 10000).toFixed(2)}万字`);
  html = html.replace(/__TARGET_WORDS__/g, Math.round(config.target_words / 10000));
  
  // 注入数据 JSON 对象
  html = html.replace('__NOVEL_DATA_JSON__', JSON.stringify(novelData, null, 2));

  const output看板Path = path.join(rootDir, '预览看板.html');
  fs.writeFileSync(output看板Path, html, 'utf-8');
  
  console.log(`\n🎉 可视化看板构建成功！`);
  console.log(`📍 预览看板路径: file:///${output看板Path.replace(/\\/g, '/')}`);
  console.log(`💡 极客贴士：您可在 VS Code 中右键此文件，点击“在 Simple Browser 中打开”直接在 IDE 内部浏览绝美看板！\n`);
}

main();
