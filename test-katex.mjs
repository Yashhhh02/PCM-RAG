import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const text = "z = \\cos \\frac{\\pi}{2} + i \\sin \\frac{\\pi}{2}";

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

processor.process(`$$${text}$$`).then((file) => {
  console.log('DISPLAY MATH:');
  console.log(String(file));
});

processor.process(`$${text}$`).then((file) => {
  console.log('INLINE MATH:');
  console.log(String(file));
});
