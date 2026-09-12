import { test } from 'node:test';
import assert from 'node:assert/strict';
import { videoPreviewUrl } from './index.ts';

test('matches the requested media, leaving the original playback URL unchanged', () => {
  const media={id:'b',type:'video',src:'https://example.com/full.mp4'};
  const post={raw:{media:[{id:'a',videoPreview:{url:'https://example.com/a-preview.mp4'}},{id:'b',videoPreview:{url:'https://example.com/b-preview.mp4'}}]}};
  assert.equal(videoPreviewUrl(post,media),'https://example.com/b-preview.mp4');
  assert.equal(media.src,'https://example.com/full.mp4');
});
test('missing, malformed and non-HTTPS previews retain the full video fallback', () => {
  const media={id:'a',type:'video',src:'https://example.com/full.mp4'};
  for(const raw of [null,{},'bad',{media:[null]},{media:[{id:'a',videoPreview:{url:'javascript:bad'}}]}])assert.equal(videoPreviewUrl({raw},media),media.src);
});
