import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import sharp from "sharp";
import { results } from "../src/results.js";

test("합격 16건, 대학 13곳을 원본 없는 공개 자산으로 제공한다", async () => {
  assert.equal(results.length, 16);
  assert.equal(new Set(results.map((r) => r.university)).size, 13);
  const files = await readdir("public/certificates");
  assert.deepEqual(files.sort(), results.map((r) => `${r.id}.webp`).sort());
  for (const file of files) {
    assert.match(file, /^[a-z]+-\d{2}\.webp$/);
    const meta = await sharp(`public/certificates/${file}`).metadata();
    assert.ok(meta.width > 700 && meta.height > 1000);
    assert.ok(
      !meta.exif && !meta.xmp && !meta.iptc,
      `${file}: metadata must be removed`,
    );
  }
});
test("페이지는 실제 문의 링크와 합격 집계 기준을 안내한다", async () => {
  const html = await readFile("index.html", "utf8");
  assert.ok(html.includes("동일 학생의 여러 대학 합격 포함"));
  assert.ok(html.includes("최종 등록 인원과 다릅니다"));
  assert.ok(html.includes('href="tel:01083329579"'));
  assert.ok(html.includes('href="sms:01083329579"'));
});
