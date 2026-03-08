"use client";

import MapView from "@/components/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MapRef } from "@/components/ui/map";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useOSMCenterDetail } from "@/lib/query/use-osm-center-detail";
import { useOSMMarkers } from "@/lib/query/use-osm-markers";
import { useSports } from "@/lib/query/use-sports";
import { Separator } from "@radix-ui/react-separator";
import clsx from "clsx";
import { ArrowUp, Check, ChevronLeft, Clock3, Copy, CreditCard, ExternalLink, History, Mail, MapPin, Phone, Search, X } from "lucide-react";
import * as React from "react";
import { Drawer } from "vaul";

const snapPoints: Array<number | string> = [0.5, 0.9];

type SearchCenter = {
  id: string;
  name: string;
  distance: string;
  coords: [number, number];
};

const DAY_ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const DAY_LABEL: Record<(typeof DAY_ORDER)[number], string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

const MONTH_INDEX: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function normalizeDayToken(token: string) {
  const cleaned = token.trim();
  if (cleaned === "To") return "Th";
  return cleaned;
}

function expandDayToken(token: string) {
  const normalized = normalizeDayToken(token);
  if (normalized.includes("-")) {
    const [rawFrom, rawTo] = normalized.split("-") as [string, string];
    const from = normalizeDayToken(rawFrom);
    const to = normalizeDayToken(rawTo);
    const fromIdx = DAY_ORDER.indexOf(from as (typeof DAY_ORDER)[number]);
    const toIdx = DAY_ORDER.indexOf(to as (typeof DAY_ORDER)[number]);
    if (fromIdx === -1 || toIdx === -1) return [] as string[];
    if (fromIdx <= toIdx) return DAY_ORDER.slice(fromIdx, toIdx + 1);
    return [...DAY_ORDER.slice(fromIdx), ...DAY_ORDER.slice(0, toIdx + 1)];
  }
  return DAY_ORDER.includes(normalized as (typeof DAY_ORDER)[number]) ? [normalized] : [];
}

function parseSeasonRange(raw?: string | null) {
  if (!raw) return null;
  const match = raw.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/i
  );
  if (!match) return null;
  const startMonth = MONTH_INDEX[match[1].slice(0, 1).toUpperCase() + match[1].slice(1, 3).toLowerCase()];
  const endMonth = MONTH_INDEX[match[3].slice(0, 1).toUpperCase() + match[3].slice(1, 3).toLowerCase()];
  const startDay = Number(match[2]);
  const endDay = Number(match[4]);
  if (!startMonth || !endMonth || !Number.isFinite(startDay) || !Number.isFinite(endDay)) return null;
  return {
    start: startMonth * 100 + startDay,
    end: endMonth * 100 + endDay,
  };
}

function isDateInSeason(now: Date, season?: string | null) {
  const parsed = parseSeasonRange(season);
  if (!parsed) return true;
  const current = (now.getMonth() + 1) * 100 + now.getDate();
  if (parsed.start <= parsed.end) {
    return current >= parsed.start && current <= parsed.end;
  }
  return current >= parsed.start || current <= parsed.end;
}

function parseOpeningHours(raw: string) {
  if (/^\s*24\/7\s*$/i.test(raw)) {
    return Object.fromEntries(DAY_ORDER.map((day) => [day, "Open 24 hours"])) as Record<string, string>;
  }

  const now = new Date();
  const rules: Array<{ season: string | null; days: string[]; hours: string }> = [];
  const schedule: Record<string, string> = {};
  const segments = raw.split(";").map((segment) => segment.trim()).filter(Boolean);
  for (const segment of segments) {
    const seasonMatch = segment.match(
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+(.+)$/i
    );
    const season = seasonMatch ? segment.slice(0, segment.length - seasonMatch[3].length).trim() : null;
    const content = seasonMatch ? seasonMatch[3].trim() : segment;

    const match = content.match(
      /^((?:Mo|Tu|We|Th|To|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|To|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|To|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|To|Fr|Sa|Su))?)*)\s+(.+)$/i
    );
    if (!match) continue;
    const dayExpr = match[1];
    const hours = match[2].trim();
    const days = dayExpr
      .split(",")
      .flatMap((token) => expandDayToken(token))
      .filter(Boolean);
    rules.push({ season, days, hours });
  }

  const activeRules = rules.filter((rule) => isDateInSeason(now, rule.season));
  const selectedRules = activeRules.length > 0 ? activeRules : rules;

  for (const rule of selectedRules) {
    for (const day of rule.days) {
      schedule[day] = rule.hours;
    }
  }
  return schedule;
}

function todayCode() {
  const jsDay = new Date().getDay(); // 0 Sun .. 6 Sat
  return (["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][jsDay] ?? "Mo") as
    | "Mo"
    | "Tu"
    | "We"
    | "Th"
    | "Fr"
    | "Sa"
    | "Su";
}

function toMinutes(text: string) {
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function getOpenState(hoursText?: string) {
  if (!hoursText) return { open: null as boolean | null, closeText: "" };
  if (/off|closed/i.test(hoursText)) return { open: false, closeText: "" };
  const rangeMatch = hoursText.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!rangeMatch) return { open: null as boolean | null, closeText: "" };
  const start = toMinutes(rangeMatch[1]);
  const end = toMinutes(rangeMatch[2]);
  if (start === null || end === null) return { open: null as boolean | null, closeText: "" };
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    end >= start
      ? nowMinutes >= start && nowMinutes <= end
      : nowMinutes >= start || nowMinutes <= end;
  return { open: isOpen, closeText: isOpen ? rangeMatch[2] : "" };
}

export default function MapPage() {
  const mapRef = React.useRef<MapRef>(null);
  const [open, setOpen] = React.useState(false);
  const [snap, setSnap] = React.useState<number | string | null>(snapPoints[0]);
  const [activeCenter, setActiveCenter] = React.useState<SearchCenter | null>(null);
  const [addressCopied, setAddressCopied] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const { data: sportsData } = useSports();
  const sportFilters = React.useMemo(() => {
    return (sportsData ?? []).map((sport) => ({
      id: sport.slug,
      label: sport.name,
    }));
  }, [sportsData]);
  const [selectedSports, setSelectedSports] = React.useState<string[]>([]);
  const queryText = query.trim().toLowerCase();

  const { data: osmMarkers } = useOSMMarkers(selectedSports, true);
  const { data: activeCenterDetail } = useOSMCenterDetail(activeCenter?.id ?? null, Boolean(activeCenter));

  console.log(snap)

  React.useEffect(() => {
    setAddressCopied(false);
  }, [activeCenter?.id]);

  console.log(activeCenterDetail)
  const recentSearches = React.useMemo(() => {
    return (osmMarkers ?? []).map((center, index) => ({
      id: center.id,
      name: center.name,
      distance: `${(1.2 + index * 0.4).toFixed(1)}km`,
      coords: [center.lon, center.lat] as [number, number],
    }));
  }, [osmMarkers]);

  const filteredCenters = React.useMemo(() => {
    if (!queryText) return [];
    return recentSearches.filter((item) =>
      item.name.toLowerCase().includes(queryText)
    );
  }, [queryText, recentSearches]);

  const mapMarkers = React.useMemo(
    () =>
      recentSearches.slice(0, 12).map((item) => ({
        id: item.id,
        name: item.name,
        coords: item.coords as [number, number],
      })),
    [recentSearches]
  );
  const openingRaw = activeCenterDetail?.openingHours ?? "";
  const openingSchedule = React.useMemo(
    () => (openingRaw ? parseOpeningHours(openingRaw) : {}),
    [openingRaw]
  );
  const today = todayCode();
  const todayHours = openingSchedule[today] ?? "";
  const hasParsedOpeningSchedule = Object.keys(openingSchedule).length > 0;
  const openState = getOpenState(todayHours);

  return (
    <div className="relative h-svh w-full overflow-hidden overscroll-none">
      <MapView
        ref={mapRef}
        className="absolute inset-0"
        markers={mapMarkers}
        onMarkerClick={(id, coordinates) => {
          const found = recentSearches.find((item) => item.id === id);
          const center =
            found ??
            ({
              id,
              name: "Sports Center",
              distance: "",
              coords: [coordinates[0], coordinates[1]] as [number, number],
            } as SearchCenter);
          setActiveCenter(center);
          setOpen(true);
          setSnap(snapPoints[0]);
        }}
      />
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
              {(query.trim() ? filteredCenters : recentSearches).length === 0 ? (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No centers found in this area.
                </li>
              ) : (
                (query.trim() ? filteredCenters : recentSearches).map((item) => (
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
                        Marker available on map
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </header>
      <ScrollArea
        className="absolute top-20 left-4 right-4 z-10 mt-3 pb-1 [&>[data-radix-scroll-area-viewport]]:overflow-x-auto [&>[data-radix-scroll-area-viewport]]:overflow-y-hidden"
      >
        <div className="flex w-max gap-2 whitespace-nowrap px-0.5 pb-1">
          {sportFilters.map((sport) => (
            <Button
              key={sport.id}
              type="button"
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                setSelectedSports((prev) => {
                  if (prev.includes(sport.id)) {
                    return prev.filter((value) => value !== sport.id);
                  }
                  return [...prev, sport.id];
                });
              }}
              className={clsx(
                "",
                selectedSports.includes(sport.id)
                  ? "bg-primary hover:bg-primary "
                  : "bg-background/80"
              )}
            >
              {sport.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

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
                    {recentSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No center data available.
                      </p>
                    ) : (
                      recentSearches.map((item) => (
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
                              {item.distance}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div
                  className={clsx(
                    "absolute inset-0 transition-all duration-300 ease-out space-y-2",
                    activeCenter
                      ? "translate-x-0 opacity-100"
                      : "pointer-events-none translate-x-4 opacity-0"
                  )}
                >
                  {activeCenter ? (
                    <>
                      <Button
                        type="button"
                        variant={"ghost"}
                        onClick={() => setActiveCenter(null)}
                        className="mb-3 flex gap-2 text-sm px-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to recent searches
                      </Button>
                      <h2 className="text-xl font-semibold">
                        {activeCenterDetail?.name ?? activeCenter.name}
                      </h2>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p className="inline-flex min-w-0 items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{activeCenterDetail?.address ?? ""}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {activeCenterDetail?.address ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full"
                              aria-label="Copy address"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(activeCenterDetail.address);
                                  setAddressCopied(true);
                                  window.setTimeout(() => setAddressCopied(false), 1200);
                                } catch {
                                  setAddressCopied(false);
                                }
                              }}
                            >
                              {addressCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          ) : null}
                          <Badge variant="outline">{activeCenter.distance}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(activeCenterDetail?.sports ?? []).map((item, idx) => {
                          return (
                        <Badge variant="default" key={idx}>
                          {item}
                        </Badge>
                          )
                        })}
                      </div>

                      <Separator orientation="horizontal" className="w-full h-0.5 bg-muted"/>

                      <div className="">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          <p className="text-sm font-semibold">Opening hours</p>
                        </div>
                        <div className="mt-2 text-sm">
                          {hasParsedOpeningSchedule && openState.open === true ? (
                            <p className="font-semibold text-emerald-600">
                              Open now{openState.closeText ? ` • Closes ${openState.closeText}` : ""}
                            </p>
                          ) : hasParsedOpeningSchedule && openState.open === false ? (
                            <p className="font-semibold text-rose-600">Closed now</p>
                          ) : (
                            <p className="font-semibold text-muted-foreground">Schedule unavailable</p>
                          )}
                        </div>
                        {hasParsedOpeningSchedule ? (
                          <div className="mt-3 rounded-xl border border-border/60 bg-card/40 text-sm">
                            {DAY_ORDER.map((day) => (
                              <div
                                key={day}
                                className={clsx(
                                  "flex items-center justify-between px-3 py-2",
                                  day !== DAY_ORDER[DAY_ORDER.length - 1] && "border-b border-border/50",
                                  day === today && "bg-muted/60 font-semibold"
                                )}
                              >
                                <span>{DAY_LABEL[day]}</span>
                                <span className={clsx(day === today ? "text-foreground" : "text-muted-foreground")}>
                                  {openingSchedule[day] ?? "Closed"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                            {openingRaw || "No opening-hours data from OSM for this center."}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 rounded-2xl border border-border/60 bg-card p-4">
                        <p className="text-sm font-semibold">Website</p>
                        {activeCenterDetail?.website ? (
                          <a
                            href={activeCenterDetail.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary"
                          >
                            {activeCenterDetail.website}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">No website</p>
                        )}
                      </div>
                      <div className="mt-3 rounded-2xl border border-border/60 bg-card p-4 text-xs">
                        <p className="text-sm font-semibold">Contact & payment</p>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{activeCenterDetail?.phone ?? ""}</span>
                          </div>
                          {activeCenterDetail?.email ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{activeCenterDetail.email}</span>
                            </div>
                          ) : null}
                          {activeCenterDetail?.payment ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>{activeCenterDetail.payment}</span>
                            </div>
                          ) : null}
                        </div>
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
