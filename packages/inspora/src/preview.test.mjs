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

test('does not choose a larger preview with no resolution advantage', () => {
  const media={id:'a',type:'video',src:'https://example.com/full.mp4'};
  const record={id:'a',sizeBytes:100,width:1080,height:1080,videoPreview:{url:'https://example.com/preview.mp4',bytes:130,width:1080,height:1080}};
  assert.equal(videoPreviewUrl({raw:{media:[record]}},media),media.src);
  record.videoPreview.width=540; record.videoPreview.height=540;
  assert.equal(videoPreviewUrl({raw:{media:[record]}},media),record.videoPreview.url);
});
