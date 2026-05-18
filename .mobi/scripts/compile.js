const fs = require('fs');
const path = require('path');

// 递归遍历文件夹获取所有 md 文件
function getMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  return results;
}

// 格式化字数统计
function countChineseWords(text) {
  if (!text) return 0;
  // 匹配汉字、标点符号与中英文字符
  const ch = text.match(/[\u4e00-\u9fa5]/g);
  const eng = text.match(/[a-zA-Z0-9]+/g);
  let total = 0;
  if (ch) total += ch.length;
  if (eng) total += eng.length;
  return total;
}

function main() {
  console.log('\n📦 [墨笔-OS] 开始编译合并小说项目...');
  
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, 'config.json');
  
  // 1. 读取全局配置
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(`📖 读取配置成功: 《${config.novel_name}》- 作者: ${config.author}`);
    } catch (e) {
      console.warn('⚠️ config.json 解析失败，将使用默认参数。');
    }
  } else {
    console.warn('⚠️ 未检测到 config.json，将以默认设置编译。');
  }

  const novelName = config.novel_name || '天码小说精编版';
  const authorName = config.author || '天码笔仙';
  const outputFilePath = config.compiler_options?.output_file 
    ? path.join(rootDir, config.compiler_options.output_file)
    : path.join(rootDir, 'dist', `精编定稿_${novelName}.txt`);

  const draftDir = path.join(rootDir, '正文草稿');
  if (!fs.existsSync(draftDir)) {
    console.error('❌ 错误：未检测到 [正文草稿] 目录，请先运行 `npm run init` 初始化项目！');
    process.exit(1);
  }

  // 2. 获取并排序章节文件
  const mdFiles = getMarkdownFiles(draftDir);
  if (mdFiles.length === 0) {
    console.warn('⚠️ 提示：[正文草稿] 目录下暂无任何章节文件，生成空白文本。');
  }

  // 排序：优先按卷文件夹名称排序，其次按章节文件名称排序
  mdFiles.sort((a, b) => {
    return a.localeCompare(b, 'zh-CN', { numeric: true });
  });

  let bookContent = `======================================================\n`;
  bookContent += `  《${novelName}》—— 墨笔-OS 协同精编定稿版\n`;
  bookContent += `  作者：${authorName}\n`;
  bookContent += `  编译时间：${new Date().toLocaleString()}\n`;
  bookContent += `======================================================\n\n`;

  let totalWords = 0;
  let chapterCount = 0;
  const chapterDetails = [];

  // 3. 处理每个章节文件
  mdFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(draftDir, filePath);
    const basename = path.basename(filePath, '.md');
    
    // a. 剥离 YAML Front Matter
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        content = parts.slice(2).join('---').trim();
      }
    }

    // b. 过滤所有的 HTML 注释 (包含 AI 修改指令与自检报告)
    // 匹配类似 <!-- ... --> 的内容
    content = content.replace(/<!--[\s\S]*?-->/g, '').trim();

    // c. 移除一些写作时的辅助行，确保定稿干净
    content = content.replace(/\[AI待生成:[\s\S]*?\]/g, '').trim();

    if (!content) return; // 过滤空文件

    chapterCount++;
    const words = countChineseWords(content);
    totalWords += words;

    chapterDetails.push({
      index: chapterCount,
      title: basename.replace(/_/g, ' '),
      words: words
    });

    // d. 将内容拼接入全书，并在章末留白
    bookContent += `\n\n\n\n`;
    bookContent += `${content}\n`;
    bookContent += `\n\n`;
  });

  // 4. 写入输出文件
  const outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, bookContent.trim(), 'utf-8');
  console.log(`\n🎉 编译合并完成！定稿文件已生成至: ${outputFilePath}`);

  // 5. 打印编译分析报告
  console.log('\n================== 📊 编译精编分析报告 ==================');
  console.log(`📚 总章节数: ${chapterCount} 章`);
  console.log(`📝 总字数量: ${totalWords.toLocaleString()} 字 (包含汉字及中英文标点)`);
  console.log('------------------------------------------------------');
  console.log('章节字数清单:');
  chapterDetails.forEach(ch => {
    console.log(`  [第 ${String(ch.index).padStart(3, '0')} 章] ${ch.title.padEnd(20, ' ')} -> ${ch.words.toLocaleString()} 字`);
  });
  console.log('======================================================\n');
}

main();
