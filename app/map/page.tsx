"use client";

import MapView from "@/components/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MapRef } from "@/components/ui/map";
import clsx from "clsx";
import { ArrowUp, ChevronLeft, History, Search, X } from "lucide-react";
import * as React from "react";
import { Drawer } from "vaul";

const snapPoints: Array<number | string> = [0.5, 0.9];

const recentSearches = [
  {
    id: "s1",
    name: "Sân Pickleball Quang Minh",
    distance: "6810.6km",
    address: "1488 Duy Tân, Hòa Thuận Tây",
    nextSlot: "6:00 PM",
    courts: "6 courts",
    coords: [24.906, 60.1702],
  },
  {
    id: "s2",
    name: "Sân Bóng Đá SeaMart Sport",
    distance: "8108.5km",
    address: "Cổng 1: 146 Duy Tân, Q7",
    nextSlot: "7:30 PM",
    courts: "3 pitches",
    coords: [24.959, 60.187],
  },
  {
    id: "s3",
    name: "Sân cầu lông Lintuvaara",
    distance: "2.8km",
    address: "Lintuvaarantie 12, Espoo",
    nextSlot: "8:15 PM",
    courts: "8 courts",
    coords: [24.843, 60.236],
  },
  {
    id: "s4",
    name: "Sân cầu lông Lintuvaara",
    distance: "2.8km",
    address: "Lintuvaarantie 12, Espoo",
    nextSlot: "8:15 PM",
    courts: "8 courts",
    coords: [24.843, 60.236],
  },
  {
    id: "s5",
    name: "Sân cầu lông Lintuvaara",
    distance: "2.8km",
    address: "Lintuvaarantie 12, Espoo",
    nextSlot: "8:15 PM",
    courts: "8 courts",
    coords: [24.843, 60.236],
  },
  {
    id: "s6",
    name: "Sân cầu lông Lintuvaara",
    distance: "2.8km",
    address: "Lintuvaarantie 12, Espoo",
    nextSlot: "8:15 PM",
    courts: "8 courts",
    coords: [24.843, 60.236],
  },
  {
    id: "s7",
    name: "Sân cầu lông Lintuvaara",
    distance: "2.8km",
    address: "Lintuvaarantie 12, Espoo",
    nextSlot: "8:15 PM",
    courts: "8 courts",
    coords: [24.843, 60.236],
  },

];

const sportFilters = [
  { id: "pickleball", label: "Sân pickleball" },
  { id: "badminton", label: "Sân cầu lông" },
  { id: "soccer", label: "Sân bóng đá" },
  { id: "tennis", label: "Sân tennis" },
  { id: "basketball", label: "Sân bóng rổ" },
  { id: "basketball2", label: "Sân bóng rổ" },
  { id: "basketball3", label: "Sân bóng rổ" },

];

export default function MapPage() {
  const mapRef = React.useRef<MapRef>(null);
  const [open, setOpen] = React.useState(false);
  const [snap, setSnap] = React.useState<number | string | null>(snapPoints[0]);
  const [activeCenter, setActiveCenter] = React.useState<
    (typeof recentSearches)[number] | null
  >(null);
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  const filteredCenters = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return recentSearches.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <div className="relative h-svh w-full overflow-hidden overscroll-none">
      <MapView ref={mapRef} className="absolute inset-0" />

      <header className="absolute left-0 right-0 top-5 px-4 z-20">
        <div
          className={clsx(
            "mx-auto w-full max-w-xl rounded-3xl border border-border/60 bg-background/90 shadow-xl backdrop-blur transition-all duration-300 ease-out",
            isSearching ? "max-h-[70vh] p-4" : "max-h-16 px-3 py-3"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                setIsSearching(true);
              }}
              placeholder="Search centers by name"
              className="h-10 flex-1 border-transparent bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            {isSearching ? (
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setQuery("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div
            className={clsx(
              "transition-all duration-300 ease-out",
              isSearching
                ? "mt-4 max-h-[50vh] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Recent</p>
              {query.trim() ? (
                <p className="text-xs text-muted-foreground">
                  {filteredCenters.length} results
                </p>
              ) : null}
            </div>
            <ul className="mt-3 max-h-[40vh] space-y-3 overflow-auto pr-1">
              {(query.trim() ? filteredCenters : recentSearches).map((item) => (
                <li
                  key={item.id}
                  onClick={() => {
                    setIsSearching(false);
                    setActiveCenter(item);
                    setOpen(true);
                    setSnap(snapPoints[1]);
                    mapRef.current?.flyTo({
                      center: item.coords as [number, number],
                      zoom: 14,
                      duration: 900,
                    });
                  }}
                  className="flex items-center gap-2 border-b border-border p-0.5"
                >
                  <History className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.address}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </header>
      <div className="absolute top-20 left-4 right-4 mt-3 overflow-x-auto pb-1">
        <div className="flex w-max gap-2 whitespace-nowrap">
          {sportFilters.map((sport) => (
            <button
              key={sport.id}
              type="button"
              className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted/40"
            >
              {sport.label}
            </button>
          ))}
        </div>
      </div>

      <Drawer.Root
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        fadeFromIndex={1}
        open={open}
        onOpenChange={setOpen}
        modal={false}
      >
        <Drawer.Trigger
          asChild
          className="absolute right-4 z-30 transition-all duration-300"
          style={{
            bottom: open
              ? typeof snap === "number"
                ? `${snap * 100}%`
                : String(snap)
              : "6rem",
          }}
        >
          <Button size="icon" className="shadow-lg">
            <ArrowUp className={open ? "rotate-180" : ""} />
          </Button>
        </Drawer.Trigger>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 pointer-events-none" />
        <Drawer.Portal>
          <Drawer.Content
            data-testid="content"
            className="fixed flex flex-col bg-background border border-border border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full mx-[-1px] z-20 pb-24 pointer-events-none overflow-hidden shadow-2xl"
          >
            <div
              className={clsx("pointer-events-auto flex flex-col max-w-md mx-auto w-full p-4 pt-5", {
                "overflow-y-auto": snap === 0.9,
                "overflow-hidden": snap !== 0.9,
              })}
            >
              <div className="relative">
                <div
                  className={clsx(
                    "transition-all duration-300 ease-out",
                    activeCenter
                      ? "pointer-events-none translate-x-4 opacity-0"
                      : "translate-x-0 opacity-100"
                  )}
                >
                  <h2 className="text-lg font-semibold">Recent searches</h2>
                  <p className="text-sm text-muted-foreground">
                    Tap a venue to see details.
                  </p>
                  <div className="mt-4 space-y-3">
                    {recentSearches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveCenter(item);
                          mapRef.current?.flyTo({
                            center: item.coords as [number, number],
                            zoom: 14,
                            duration: 900,
                          });
                        }}
                        className="w-full rounded-2xl border border-border/60 bg-card px-4 py-3 text-left shadow-sm transition hover:bg-muted/40 flex gap-4 items-center"
                      >
                        <History />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.distance} · {item.address}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={clsx(
                    "absolute inset-0 transition-all duration-300 ease-out",
                    activeCenter
                      ? "translate-x-0 opacity-100"
                      : "pointer-events-none translate-x-4 opacity-0"
                  )}
                >
                  {activeCenter ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveCenter(null)}
                        className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to recent searches
                      </button>
                      <h2 className="text-xl font-semibold">
                        {activeCenter.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {activeCenter.address}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">{activeCenter.courts}</Badge>
                        <Badge variant="outline">{activeCenter.distance}</Badge>
                        <Badge variant="outline">
                          Next: {activeCenter.nextSlot}
                        </Badge>
                      </div>
                      <div className="mt-6 rounded-2xl bg-muted/40 p-4">
                        <p className="text-sm font-semibold">Today availability</p>
                        <p className="text-xs text-muted-foreground">
                          6:00 PM · 7:30 PM · 9:00 PM
                        </p>
                      </div>
                      <Button className="mt-6 w-full">Book now</Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
