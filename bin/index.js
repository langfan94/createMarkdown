#!/usr/bin/env node
const path = require('path');
const process = require('node:process');
const { program } = require('commander');
const fs = require('node:fs/promises');
const matter = require('gray-matter');
const moment = require('moment');
const { stringify } = require("yaml");

async function fileIsExist(filename) {
  try {
    const res = await fs.access(filename, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function createFile(opt) {
  const {
    output,
    filename,
    title,
  } = opt;
  const directory = path.resolve(process.cwd(), output);
  const filePath = `${directory}/${filename}.md`;
  try {
    const isExist = await fileIsExist(filePath);
    if (isExist) {
      // 文件存在 先删除原文件
      await fs.unlink(filePath);
    }
    let fh = await fs.open(filePath, 'a');
    const { data: frontMatter, content } = matter.read('./template.md');
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    frontMatter.date = now;
    frontMatter.title = title;
    const newContent = `---\n${stringify(frontMatter)}---\n${content}`;
    await fh.write(newContent);
    await fh.close();
  } catch (error) {
    console.error(error);
  }
}

program
  .option('-o --output <output>', 'relative path of output', './')
  .option('-f, --filename <filename>', 'output filename')
  .option('-t --title <title>')
  .action((commandAndOptions) => {
    if (!commandAndOptions.filename) {
      console.error(`filename isRequired`);
      return;
    }
    createFile(commandAndOptions);
    if (commandAndOptions.debug) {
      console.error(`Called ${commandAndOptions.name()}`);
    };
  });

program.parse();
