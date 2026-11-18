import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* تعطيل ملف القفل .next/lock — Next 16 ينشئه افتراضيًا،
       وVercel يفشل أثناء رفع المخرجات: ENOENT lstat .next/lock */
    lockDistDir: false,
  },
};

export default nextConfig;