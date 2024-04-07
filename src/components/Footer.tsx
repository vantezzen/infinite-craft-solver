import React from "react";

function Footer() {
  return (
    <div className="text-center mt-12">
      <a
        href="https://vantezzen.io"
        target="_blank"
        rel="noreferrer"
        className="text-zinc-800 font-medium mt-12"
      >
        Made by <span className="underline">vantezzen</span>
        <br />
        <span className="text-sm">
          Silly little projects for when you need a break from reality
        </span>
      </a>
      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-3 text-xs mt-6">
        <a
          href="https://wrapped.vantezzen.io/legal/terms"
          className="text-zinc-800 font-medium"
        >
          Terms of Service
        </a>
        <a
          href="https://wrapped.vantezzen.io/legal/privacy"
          className="text-zinc-800 font-medium"
        >
          Privacy Policy
        </a>
        <a
          href="https://wrapped.vantezzen.io/legal/impressum"
          className="text-zinc-800 font-medium"
        >
          Impressum
        </a>
      </div>
      <div className="text-center mb-6 text-xs">
        <p className="text-zinc-400">
          This website is not affiliated with neal.fun's Infinite Craft. All
          rights for the game and its assets belong to neal.fun.
        </p>
      </div>
    </div>
  );
}

export default Footer;
