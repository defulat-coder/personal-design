import { upstream } from '@personal-design/layout-compositions';

/** CC BY 4.0 要求的署名：来源 + 许可证链接 + 改编说明。 */
export function Attribution() {
  return (
    <p className="text-xs leading-6 text-neutral-500">
      内容改编自{' '}
      <a
        href={upstream.url}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-neutral-600"
      >
        {upstream.author}/{upstream.name}
      </a>
      ，依{' '}
      <a
        href={upstream.licenseUrl}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-neutral-600"
      >
        {upstream.license}
      </a>{' '}
      许可证使用。
    </p>
  );
}
