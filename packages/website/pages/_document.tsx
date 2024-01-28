import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { getTheme, initTheme } from "../utils/theme";
import { checkLogin } from "../utils/auth";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Document() {

  useEffect(() => {
    // 在这里添加逻辑检查用户是否已登录
    const isUserLoggedIn = checkLogin()

    // 如果用户未登录，跳转到百度
    if (!isUserLoggedIn) {
      window.location.href = 'https://www.baidu.com';
    }
  }, []);

  return (
    <Html className={getTheme(initTheme()).replace("auto-", "")} lang="zh">
      <Head>
        <Script src="/initTheme.js" strategy="beforeInteractive" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
