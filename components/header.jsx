"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import SearchBar from "../components/searchbar.jsx"


import {
  faList,
  faTv,
  faBookOpen,
  faArrowTrendUp,
  faComments,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export default function Header({ title }) {  const path = usePathname();

  const pageTitles = {
    "/": "My Anime List",
    "/search": "Search",
  };


  const pageTitle = title || pageTitles[path] || "N/A";
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "My List", icon: faList, href: "/" },
    { name: "Animes", icon: faTv, href: "/404" },
    { name: "Mangas", icon: faBookOpen, href: "/404" },
    { name: "Trending", icon: faArrowTrendUp, href: "/404" },
    { name: "Forums", icon: faComments, href: "/404" },
    { name: "Search", icon: faMagnifyingGlass, href: "/search" },
  ];

  const navItems = [
    { name: "My List", href: "/" },
    { name: "Search", href: "/search" },
    { name: "Seasonal", href: "/404" },
    { name: "Top Anime", href: "/404" },
    { name: "Forums", href: "/404" },
  ];

  return (
    <header className="relative w-full bg-white font-sans text-black">

      {/* Top Header */}
      <div className="relative flex h-[64px] items-center justify-between gap-4 px-5">

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex w-[24px] flex-col gap-[5px] cursor-pointer"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span className="h-[2px] w-5 bg-[#333]" />
          <span className="h-[2px] w-5 bg-[#333]" />
          <span className="h-[2px] w-5 bg-[#333]" />
        </button>

        {/* Logo */}
        <Link href="/">
          <img
            src="/mal.png"
            alt="MyAnimeList"
            className="absolute left-1/2 -translate-x-1/2 h-[50px] align-middle translate-y-[-20px]"
          />
        </Link>

        {/* Profile */}
        <button className="flex cursor-pointer items-center gap-[9px] text-xs font-semibold text-[#234b9c]">
          <div className="h-[27px] w-[27px] bg-[#ddd]" />
          <span className="max-sm:hidden">pseudo_account_test</span>
          <span className="text-[9px]">▼</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="mx-[18px] flex min-h-[42px] items-center justify-between bg-[#3154a1] max-md:flex-wrap rounded-tl-xs rounded-tr-xs">

        {/* Navigation Links */}
        <div className="flex h-[38px] items-stretch overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex shrink-0 cursor-pointer items-center px-[14px] text-sm font-normal text-white transition-colors hover:bg-[#24458b]"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* search */}
          <Suspense><SearchBar restore={false} className="w-[360px] h-[26px] text-xs" /></Suspense>
      </nav>

      {/* what page user is on */}
      <div className="mx-[18px] border-b-2 border-[#b5bdcc] bg-[#e1e7f3] px-[11px] py-[12px] rounded-bl-xs rounded-br-xs">
        <h1 className="text-[20px] font-semibold">
          {pageTitle}
        </h1>
      </div>
      {/* Dark Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[100] bg-black/35 transition-opacity duration-300 ${
          menuOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out Sidebar */}
      <aside
        aria-hidden={!menuOpen}
        className={`fixed left-0 top-0 z-[101] flex h-screen w-[300px] max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Sidebar Header */}
        <div className="flex h-[60px] shrink-0 items-center gap-5 border-b border-gray-200 px-6">

          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            className="cursor-pointer text-[32px] leading-none text-[#333] hover:text-[#3155a4]"
          >
            ‹
          </button>

          {/* Sidebar Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <img
              src="/mal.png"
              alt="MyAnimeList"
              className="h-[32px] align-middle translate-y-[4px] translate-x-[-21px]"
            />
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="flex h-[51px] shrink-0 items-center gap-5 border-b border-gray-200 px-6 text-left text-sm font-normal text-[#333] transition-colors hover:bg-gray-100"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="w-[18px] text-[18px] text-[#3155a4]"
              />

              {item.name}
            </Link>
          ))}
        </div>
      </aside>
    </header>
  );
}
