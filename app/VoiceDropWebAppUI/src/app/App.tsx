import { useState, useEffect, useRef } from "react";
import {
  Mic, Search, Bell, MessageSquare, ChevronDown, Play, Pause,
  ArrowUp, ArrowDown, Gift, Share2, Bookmark, Flag, MoreHorizontal,
  Plus, Home, TrendingUp, Compass, Star, Volume2, Download,
  Check, X, Camera, Users, Clock, Settings, LogOut, ChevronRight,
  Zap, Radio, Hash, AtSign, Filter, LayoutGrid, List, Send,
  RefreshCw, SkipBack, SkipForward, Rewind, FastForward
} from "lucide-react";

// ─── Waveform ──────────────────────────────────────────────────────────────
const BARS = 40;
const waveHeights = [
  30,50,70,45,85,60,35,90,55,40,75,50,65,80,45,30,70,55,90,40,
  60,75,35,85,50,65,40,80,55,70,45,90,35,60,75,50,40,85,65,30
];
const MAX_RECORDING_SECONDS = 15 * 60;

function Waveform({ playing, color = "#1D9E75", height = 36, progress = 0 }: {
  playing: boolean; color?: string; height?: number; progress?: number;
}) {
  return (
    <div className="flex items-center gap-[2px]" style={{ height }}>
      {waveHeights.map((h, i) => {
        const pct = (i / BARS) * 100;
        const filled = pct <= progress;
        return (
          <div
            key={i}
            className="rounded-full flex-shrink-0 transition-all"
            style={{
              width: 3,
              height: `${Math.max(20, h)}%`,
              background: filled ? color : `${color}44`,
              animationName: playing ? "waveBar" : "none",
              animationDuration: `${0.5 + (i % 7) * 0.08}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationDelay: `${(i % 9) * 0.05}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes waveBar {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Mini Voice Player ──────────────────────────────────────────────────────
function VoicePlayer({
  duration = "0:45",
  effect,
  compact = false,
}: {
  duration?: string;
  effect?: string;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 0.5;
        });
      }, 80);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-[#1C2128] rounded-lg px-3 py-2 flex-1">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-7 h-7 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0 hover:bg-[#17845F] transition-colors"
        >
          {playing ? <Pause size={12} fill="white" className="text-white" /> : <Play size={12} fill="white" className="text-white ml-0.5" />}
        </button>
        <Waveform playing={playing} height={24} progress={progress} />
        <span className="text-[11px] text-[#7D8590] font-mono flex-shrink-0">{duration}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1C2128] rounded-xl p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0 hover:bg-[#17845F] transition-colors shadow-lg"
        >
          {playing ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
        </button>
        <div className="flex-1">
          <Waveform playing={playing} progress={progress} />
        </div>
        <span className="text-xs text-[#7D8590] font-mono flex-shrink-0">{duration}</span>
      </div>
      {effect && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[11px] bg-[#534AB7]/20 text-[#A89EFF] border border-[#534AB7]/30 rounded-full px-2 py-0.5">
            {effect}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
const GRADIENTS = [
  "from-[#1D9E75] to-[#534AB7]",
  "from-[#534AB7] to-[#993C1D]",
  "from-[#854F0B] to-[#1D9E75]",
  "from-[#993C1D] to-[#534AB7]",
  "from-[#1D9E75] to-[#854F0B]",
];
function Avatar({ seed = 0, size = 8, text = "" }: { seed?: number; size?: number; text?: string }) {
  const g = GRADIENTS[seed % GRADIENTS.length];
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${g} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold" style={{ fontSize: size * 1.8 }}>{text.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ─── Post Card ──────────────────────────────────────────────────────────────
interface Post {
  id: number;
  room: string;
  roomSeed: number;
  user: string;
  time: string;
  title: string;
  duration: string;
  effect?: string;
  transcript: string;
  votes: number;
  comments: number;
  gifts: number;
  tag?: string;
}

function PostCard({ post, onClick }: { post: Post; onClick?: () => void }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [joined, setJoined] = useState(false);
  const votes = post.votes + (vote === "up" ? 1 : vote === "down" ? -1 : 0);

  return (
    <div
      className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#1D9E75]/40 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2 text-xs text-[#7D8590]">
        <Avatar seed={post.roomSeed} size={6} text={post.room} />
        <span className="text-[#ADBAC7] font-medium hover:text-[#1D9E75] transition-colors">r/{post.room}</span>
        <span>·</span>
        <span>{post.time}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
          className={`ml-auto rounded-full px-3 py-0.5 text-xs font-medium border transition-all ${
            joined
              ? "bg-[#1D9E75] border-[#1D9E75] text-white"
              : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/10"
          }`}
        >
          {joined ? "Joined" : "Join"}
        </button>
        <button onClick={(e) => e.stopPropagation()} className="hover:text-[#ADBAC7] transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {post.tag && (
        <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-[#1D9E75] bg-[#1D9E75]/10 rounded-full px-2 py-0.5 mb-2">
          {post.tag}
        </span>
      )}

      <h3 className="text-[#E6EDF3] font-medium text-[15px] mb-3 leading-snug">{post.title}</h3>

      <div onClick={(e) => e.stopPropagation()}>
        <VoicePlayer duration={post.duration} effect={post.effect} />
      </div>

      <p className="mt-2 text-xs text-[#7D8590] italic leading-relaxed line-clamp-2">
        "{post.transcript}"
      </p>

      <div className="flex items-center gap-1 mt-3 text-xs text-[#7D8590]">
        <div className="flex items-center bg-[#1C2128] rounded-full overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setVote(vote === "up" ? null : "up"); }}
            className={`flex items-center gap-1 px-3 py-1.5 hover:bg-[#1D9E75]/10 transition-colors ${vote === "up" ? "text-[#1D9E75]" : ""}`}
          >
            <ArrowUp size={13} />
            <span className="font-medium">{votes}</span>
          </button>
          <div className="w-px h-4 bg-[#30363D]" />
          <button
            onClick={(e) => { e.stopPropagation(); setVote(vote === "down" ? null : "down"); }}
            className={`px-3 py-1.5 hover:bg-[#993C1D]/10 transition-colors ${vote === "down" ? "text-[#993C1D]" : ""}`}
          >
            <ArrowDown size={13} />
          </button>
        </div>
        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-[#1C2128] rounded-full px-3 py-1.5 hover:bg-[#534AB7]/10 hover:text-[#A89EFF] transition-colors">
          <MessageSquare size={13} />
          <span>{post.comments}</span>
        </button>
        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-[#1C2128] rounded-full px-3 py-1.5 hover:bg-[#854F0B]/20 hover:text-amber-400 transition-colors">
          <Gift size={13} />
          <span>{post.gifts}</span>
        </button>
        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-[#1C2128] rounded-full px-3 py-1.5 hover:bg-[#1D9E75]/10 hover:text-[#1D9E75] transition-colors ml-auto">
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const POSTS: Post[] = [
  {
    id: 1, room: "SpillTheTea", roomSeed: 0, user: "anonyvibe_91", time: "2hr ago",
    title: "What would be your reaction to this? I still can't believe it happened",
    duration: "0:45", effect: "🎭 Disguised",
    transcript: "So basically my roommate just walked in and said the most unhinged thing I've ever heard in my 22 years of living on this earth...",
    votes: 213, comments: 199, gifts: 4, tag: "Confession"
  },
  {
    id: 2, room: "WorkStories", roomSeed: 1, user: "corporate_rant99", time: "3hr ago",
    title: "My boss literally said this in a meeting today 😭",
    duration: "0:32", effect: "🤖 Robot voice",
    transcript: "So we're in this all-hands meeting right, forty people on the call, and he just unmutes himself and goes...",
    votes: 89, comments: 45, gifts: 2, tag: "Rant"
  },
  {
    id: 3, room: "CollegeLife", roomSeed: 2, user: "hostelboi_iit", time: "5hr ago",
    title: "Hostel warden caught me sneaking out at 2am — the convo that followed 💀",
    duration: "1:07", effect: "🎤 Normal",
    transcript: "Okay so I thought everyone was asleep. I had my shoes in my hand, tiptoeing past the guard booth, and then I hear...",
    votes: 445, comments: 312, gifts: 19, tag: "Story"
  },
  {
    id: 4, room: "Relationships", roomSeed: 3, user: "heartbreak_anon", time: "6hr ago",
    title: "She said something that changed everything for me",
    duration: "0:58", effect: "🌊 Echo",
    transcript: "I didn't know how to process it at first. We've been together three years and she just casually mentioned over dinner that...",
    votes: 1204, comments: 567, gifts: 33, tag: "Opinion"
  },
  {
    id: 5, room: "TrueConfessions", roomSeed: 4, user: "shadow_anon_x", time: "8hr ago",
    title: "I never told anyone this, but here goes nothing",
    duration: "2:14", effect: "👻 Ghost",
    transcript: "Okay I'm going to keep this anonymous. This happened when I was in class 11 and I've carried it ever since...",
    votes: 3401, comments: 891, gifts: 67, tag: "Confession"
  },
];

const ROOMS = [
  { name: "SpillTheTea", members: "2.1M", seed: 0 },
  { name: "WorkStories", members: "890K", seed: 1 },
  { name: "CollegeLife", members: "1.4M", seed: 2 },
  { name: "Relationships", members: "3.2M", seed: 3 },
  { name: "TrueConfessions", members: "560K", seed: 4 },
  { name: "Delhi", members: "780K", seed: 0 },
  { name: "MumbaiVoices", members: "430K", seed: 1 },
  { name: "Bollywood", members: "1.1M", seed: 2 },
];

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ screen, setScreen, loggedIn, setLoggedIn }: {
  screen: number; setScreen: (n: number) => void; loggedIn: boolean; setLoggedIn: (v: boolean) => void;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#161B22]/95 backdrop-blur border-b border-[#30363D] flex items-center px-4 gap-3">
      <button onClick={() => setScreen(loggedIn ? 2 : 1)} className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center">
          <Mic size={14} fill="white" className="text-white" />
        </div>
        <span className="font-bold text-[#E6EDF3] text-sm hidden sm:block">VoiceDrop</span>
      </button>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8590]" />
          <input
            className="w-full bg-[#1C2128] border border-[#30363D] rounded-full pl-8 pr-4 py-1.5 text-xs text-[#ADBAC7] placeholder-[#7D8590] focus:outline-none focus:border-[#1D9E75] transition-colors"
            placeholder="Find voices, rooms, topics..."
            onClick={() => setScreen(8)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {loggedIn ? (
          <>
            <button onClick={() => setScreen(7)} className="relative w-8 h-8 flex items-center justify-center text-[#7D8590] hover:text-[#ADBAC7] transition-colors">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#993C1D] rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-[#7D8590] hover:text-[#ADBAC7] transition-colors">
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => setScreen(4)}
              className="flex items-center gap-1.5 bg-[#1D9E75] hover:bg-[#17845F] text-white rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Mic size={12} />
              <span className="hidden sm:block">Record</span>
            </button>
            <button onClick={() => setScreen(6)} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#534AB7] flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setLoggedIn(true)}
              className="border border-[#30363D] text-[#E6EDF3] rounded-full px-4 py-1.5 text-xs font-medium hover:border-[#7D8590] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => setLoggedIn(true)}
              className="bg-[#1D9E75] hover:bg-[#17845F] text-white rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Left Sidebar (logged-in) ────────────────────────────────────────────────
function LeftSidebar({ setScreen }: { setScreen: (n: number) => void }) {
  const navItems = [
    { icon: Home, label: "Home", screen: 2 },
    { icon: TrendingUp, label: "Popular", screen: 8 },
    { icon: Compass, label: "Explore", screen: 8 },
  ];
  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <div className="sticky top-16 pt-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, screen }) => (
          <button
            key={label}
            onClick={() => setScreen(screen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#ADBAC7] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors text-sm"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        <button
          onClick={() => setScreen(4)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1D9E75] hover:bg-[#1D9E75]/10 transition-colors text-sm"
        >
          <Plus size={16} />
          Create Room
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7D8590]">Rooms</span>
        </div>
        {ROOMS.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setScreen(5)}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#ADBAC7] hover:bg-[#1C2128] hover:text-[#E6EDF3] transition-colors text-xs"
          >
            <Avatar seed={r.seed} size={5} text={r.name} />
            <span>r/{r.name}</span>
            <Star size={10} className="ml-auto text-[#534AB7] opacity-60" />
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── Right Sidebar ───────────────────────────────────────────────────────────
function RightSidebarRooms({ setScreen }: { setScreen: (n: number) => void }) {
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  return (
    <aside className="w-72 flex-shrink-0 hidden xl:block">
      <div className="sticky top-16 pt-3 space-y-3">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7D8590]">Popular Rooms</span>
          </div>
          {ROOMS.slice(0, 5).map((r, i) => (
            <div key={r.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1C2128] transition-colors">
              <span className="text-[#7D8590] text-xs w-4">{i + 1}</span>
              <Avatar seed={r.seed} size={7} text={r.name} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#E6EDF3] truncate">r/{r.name}</p>
                <p className="text-[10px] text-[#7D8590]">{r.members} members</p>
              </div>
              <button
                onClick={() => setJoined(j => ({ ...j, [i]: !j[i] }))}
                className={`text-[10px] font-medium rounded-full px-2.5 py-1 border transition-all flex-shrink-0 ${
                  joined[i] ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/10"
                }`}
              >
                {joined[i] ? "Joined" : "Join"}
              </button>
            </div>
          ))}
          <button onClick={() => setScreen(8)} className="w-full text-center text-xs text-[#1D9E75] hover:text-[#17845F] py-2.5 border-t border-[#30363D] transition-colors">
            See more rooms →
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── SCREEN 1 — Landing ──────────────────────────────────────────────────────
function Screen1({ setScreen, setLoggedIn }: { setScreen: (n: number) => void; setLoggedIn: (v: boolean) => void }) {
  return (
    <div className="flex gap-6">
      {/* Left auth sidebar */}
      <aside className="w-60 flex-shrink-0 hidden lg:flex flex-col gap-4 sticky top-16 h-fit pt-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <Mic size={16} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-[#E6EDF3]">VoiceDrop</span>
          </div>
          <p className="text-xs text-[#7D8590] mb-4 leading-relaxed">Join the most authentic place on the internet — where your voice is the post.</p>

          <div className="space-y-2">
            {[
              { icon: "🔵", label: "Continue with Google" },
              { icon: "📱", label: "Continue with Phone" },
              { icon: "✉️", label: "Continue with Email" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => { setLoggedIn(true); setScreen(2); }}
                className="w-full flex items-center gap-2 bg-[#E6EDF3] hover:bg-white text-[#0D1117] rounded-full px-3 py-2 text-xs font-medium transition-colors"
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#7D8590] text-center mt-3 leading-relaxed">
            By continuing, you agree to our <span className="text-[#1D9E75]">Terms</span> and <span className="text-[#1D9E75]">Privacy Policy</span>.
          </p>
        </div>

        {/* Animated waveform illustration */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 overflow-hidden">
          <p className="text-[10px] text-[#7D8590] uppercase tracking-widest font-semibold mb-3">Live Now</p>
          <Waveform playing={true} height={48} />
          <Waveform playing={true} height={32} color="#534AB7" />
          <Waveform playing={true} height={24} color="#854F0B" />
        </div>
      </aside>

      {/* Main feed */}
      <main className="flex-1 min-w-0 pt-3">
        <div className="flex items-center gap-2 mb-4 text-xs text-[#7D8590]">
          <button className="flex items-center gap-1 bg-[#1C2128] border border-[#30363D] rounded-full px-3 py-1.5 hover:border-[#7D8590] transition-colors">
            Best <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 bg-[#1C2128] border border-[#30363D] rounded-full px-3 py-1.5 hover:border-[#7D8590] transition-colors">
            Everywhere <ChevronDown size={12} />
          </button>
          <button className="ml-auto w-8 h-8 flex items-center justify-center bg-[#1C2128] border border-[#30363D] rounded-lg hover:border-[#7D8590] transition-colors">
            <LayoutGrid size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {POSTS.slice(0, 3).map(p => (
            <PostCard key={p.id} post={p} onClick={() => setScreen(3)} />
          ))}
        </div>
      </main>

      {/* Right sidebar */}
      <RightSidebarRooms setScreen={setScreen} />
    </div>
  );
}

// ─── SCREEN 2 — Home (logged in) ────────────────────────────────────────────
function Screen2({ setScreen }: { setScreen: (n: number) => void }) {
  const [activeTab, setActiveTab] = useState("For You");
  const tabs = ["For You", "Following", "Rooms", "Trending"];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0 pt-3">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === t
                  ? "bg-[#1D9E75] text-white"
                  : "bg-[#1C2128] text-[#7D8590] hover:text-[#ADBAC7]"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button className="flex items-center gap-1 bg-[#1C2128] border border-[#30363D] rounded-full px-3 py-1.5 text-xs text-[#7D8590] hover:border-[#7D8590] transition-colors">
              Best <ChevronDown size={12} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {POSTS.map(p => (
            <PostCard key={p.id} post={p} onClick={() => setScreen(3)} />
          ))}
        </div>
      </main>
      <RightSidebarRooms setScreen={setScreen} />
    </div>
  );
}

// ─── SCREEN 3 — Post Detail ──────────────────────────────────────────────────
function Screen3({ setScreen }: { setScreen: (n: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [replyText, setReplyText] = useState("");
  const [recordingReply, setRecordingReply] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState("normal");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => { if (p >= 100) { setPlaying(false); return 0; } return p + 0.3; });
      }, 60);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const replies = [
    { user: "night_owl_kriti", time: "1hr ago", duration: "0:18", votes: 34, seed: 1, nested: false },
    { user: "anon_vibes_90", time: "2hr ago", duration: "0:09", votes: 12, seed: 2, nested: true },
    { user: "realist_rajan", time: "3hr ago", duration: "0:25", votes: 67, seed: 3, nested: false },
  ];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0 pt-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-[#7D8590] mb-4">
          <button onClick={() => setScreen(5)} className="hover:text-[#1D9E75] transition-colors">r/WorkStories</button>
          <ChevronRight size={12} />
          <span className="text-[#ADBAC7] truncate">My boss literally said this in a meeting today</span>
        </div>

        {/* Post */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-xs text-[#7D8590]">
            <Avatar seed={1} size={7} text="W" />
            <span className="text-[#1D9E75] font-medium">r/WorkStories</span>
            <span>·</span>
            <span className="text-[#ADBAC7]">u/corporate_rant99</span>
            <span>·</span>
            <span>3hr ago</span>
            <button className="ml-auto rounded-full px-3 py-1 border border-[#1D9E75] text-[#1D9E75] text-xs hover:bg-[#1D9E75]/10 transition-colors">
              Join
            </button>
            <button className="hover:text-[#ADBAC7] transition-colors"><MoreHorizontal size={14} /></button>
          </div>

          <h1 className="text-[#E6EDF3] text-xl font-semibold mb-4 leading-snug">
            My boss literally said this in a meeting today 😭
          </h1>

          {/* Large player */}
          <div className="bg-[#1C2128] rounded-xl p-4 mb-4">
            <Waveform playing={playing} height={64} progress={progress} />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setProgress(Math.max(0, progress - 10))}
                className="text-[#7D8590] hover:text-[#ADBAC7] transition-colors"
              >
                <Rewind size={16} />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="w-12 h-12 rounded-full bg-[#1D9E75] hover:bg-[#17845F] flex items-center justify-center transition-colors shadow-lg shadow-[#1D9E75]/20"
              >
                {playing ? <Pause size={20} fill="white" className="text-white" /> : <Play size={20} fill="white" className="text-white ml-0.5" />}
              </button>
              <button
                onClick={() => setProgress(Math.min(100, progress + 10))}
                className="text-[#7D8590] hover:text-[#ADBAC7] transition-colors"
              >
                <FastForward size={16} />
              </button>
              <div className="flex-1 h-1.5 bg-[#30363D] rounded-full cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}>
                <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <Volume2 size={14} className="text-[#7D8590]" />
              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${speed === s ? "bg-[#1D9E75] text-white" : "text-[#7D8590] hover:text-[#ADBAC7]"}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-[#7D8590]">0:32</span>
              <button className="text-[#7D8590] hover:text-[#ADBAC7] transition-colors"><Download size={14} /></button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] bg-[#534AB7]/20 text-[#A89EFF] border border-[#534AB7]/30 rounded-full px-2 py-0.5">🤖 Robot voice</span>
            </div>
          </div>

          {/* Transcript */}
          <div className="border border-[#30363D] rounded-lg overflow-hidden mb-4">
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#ADBAC7] hover:bg-[#1C2128] transition-colors"
            >
              <span className="flex items-center gap-2">📝 Transcript</span>
              <ChevronDown size={13} className={`transition-transform ${transcriptOpen ? "rotate-180" : ""}`} />
            </button>
            {transcriptOpen && (
              <div className="px-4 py-3 bg-[#1C2128] border-t border-[#30363D]">
                <p className="text-xs text-[#7D8590] italic leading-relaxed">
                  "So we're in this all-hands meeting, right? Forty people on the Zoom call. And my boss — completely seriously — goes: 'Guys, I think the problem with our productivity is that people are thinking too much.' And then he paused... like he expected applause."
                </p>
                <span className="inline-block mt-2 text-[10px] bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20 rounded-full px-2 py-0.5">
                  Translated from Hindi
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 text-xs text-[#7D8590] flex-wrap">
            <div className="flex items-center bg-[#1C2128] rounded-full overflow-hidden">
              <button onClick={() => setVote(vote === "up" ? null : "up")} className={`flex items-center gap-1 px-3 py-1.5 hover:bg-[#1D9E75]/10 transition-colors ${vote === "up" ? "text-[#1D9E75]" : ""}`}>
                <ArrowUp size={13} /><span className="font-medium">{89 + (vote === "up" ? 1 : vote === "down" ? -1 : 0)}</span>
              </button>
              <div className="w-px h-4 bg-[#30363D]" />
              <button onClick={() => setVote(vote === "down" ? null : "down")} className={`px-3 py-1.5 hover:bg-[#993C1D]/10 transition-colors ${vote === "down" ? "text-[#993C1D]" : ""}`}>
                <ArrowDown size={13} />
              </button>
            </div>
            {[
              { icon: MessageSquare, label: "45 replies" },
              { icon: Gift, label: "Gift" },
              { icon: Share2, label: "Share" },
              { icon: Bookmark, label: "Save" },
              { icon: Flag, label: "Report" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex items-center gap-1 bg-[#1C2128] rounded-full px-3 py-1.5 hover:bg-[#30363D] transition-colors">
                <Icon size={13} /><span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice replies */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#E6EDF3]">Voice replies (45)</h3>
            <button className="flex items-center gap-1 text-xs text-[#7D8590] hover:text-[#ADBAC7] transition-colors">
              Sort: Best <ChevronDown size={12} />
            </button>
          </div>

          {/* Record reply */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRecordingReply(!recordingReply)}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  recordingReply
                    ? "bg-[#993C1D] shadow-lg shadow-[#993C1D]/30 animate-pulse"
                    : "bg-[#1D9E75] hover:bg-[#17845F]"
                }`}
              >
                <Mic size={16} className="text-white" />
              </button>
              <div className="flex-1">
                {recordingReply ? (
                  <div className="flex items-center gap-2">
                    <Waveform playing={true} height={28} color="#993C1D" />
                    <span className="text-xs font-mono text-[#993C1D]">0:05</span>
                  </div>
                ) : (
                  <span className="text-xs text-[#7D8590]">Record your reply...</span>
                )}
              </div>
              <div className="flex gap-1">
                {["🎤", "🤖", "🔊", "🐿️"].map(e => (
                  <button key={e} onClick={() => setSelectedEffect(e)} className={`text-base w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${selectedEffect === e ? "bg-[#1D9E75]/20" : "hover:bg-[#1C2128]"}`}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Reply cards */}
          <div className="space-y-3">
            {replies.map((r, i) => (
              <div key={i} className={`${r.nested ? "ml-8 border-l-2 border-[#30363D] pl-4" : ""}`}>
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2 text-xs text-[#7D8590]">
                    <Avatar seed={r.seed} size={6} text={r.user} />
                    <span className="text-[#ADBAC7] font-medium">u/{r.user}</span>
                    <span>·</span>
                    <span>{r.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VoicePlayer duration={r.duration} compact />
                    <div className="flex items-center bg-[#1C2128] rounded-full overflow-hidden flex-shrink-0">
                      <button className="px-2 py-1 hover:text-[#1D9E75] transition-colors"><ArrowUp size={11} /></button>
                      <span className="text-[10px] font-medium px-1">{r.votes}</span>
                      <button className="px-2 py-1 hover:text-[#993C1D] transition-colors"><ArrowDown size={11} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right sidebar — about room */}
      <aside className="w-72 flex-shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-3">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1D9E75]/30 to-[#534AB7]/20 px-4 py-5">
              <div className="flex items-center gap-3 mb-2">
                <Avatar seed={1} size={8} text="W" />
                <div>
                  <p className="font-semibold text-[#E6EDF3] text-sm">r/WorkStories</p>
                  <p className="text-[10px] text-[#7D8590]">2.1M members · 4.2K listening now</p>
                </div>
              </div>
              <button className="w-full bg-[#1D9E75] hover:bg-[#17845F] text-white rounded-full py-2 text-xs font-semibold transition-colors mt-2">
                Join Room
              </button>
            </div>
            <div className="px-4 py-3 border-t border-[#30363D]">
              <p className="text-xs text-[#7D8590] leading-relaxed mb-3">Share your wildest, funniest, and most unbelievable workplace stories — in your actual voice.</p>
              <p className="text-[10px] text-[#7D8590] mb-3">Created Jan 2024</p>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7D8590]">Rules</p>
                {["1. Keep it real — no scripted content", "2. No identifying coworkers by name", "3. Work-related only", "4. Be kind in replies"].map(r => (
                  <p key={r} className="text-[11px] text-[#ADBAC7]">{r}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── SCREEN 4 — Create Post ──────────────────────────────────────────────────
function Screen4({ setScreen }: { setScreen: (n: number) => void }) {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState("Normal");
  const [anon, setAnon] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Story");
  const [showEvidence, setShowEvidence] = useState(false);
  const [room, setRoom] = useState("Choose a room");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setTimer(t => {
        if (t >= MAX_RECORDING_SECONDS - 1) {
          stopRecording();
          return MAX_RECORDING_SECONDS;
        }
        return t + 1;
      }), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recording]);

  function stopRecording() {
    setRecording(false);
    setRecorded(true);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const effects = [
    { label: "Normal", free: true }, { label: "Robot", free: true }, { label: "Deep", free: true }, { label: "Chipmunk", free: true },
    { label: "Echo", free: false }, { label: "Alien", free: false }, { label: "Ghost", free: false }, { label: "Studio", free: false },
  ];
  const tags = ["Confession", "Rant", "Story", "Opinion", "Question"];
  const rooms = ["SpillTheTea", "WorkStories", "CollegeLife", "Relationships", "TrueConfessions", "Delhi", "Bollywood"];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0 pt-3 max-w-2xl">
        <h1 className="text-lg font-semibold text-[#E6EDF3] mb-5">Create a Voice Post</h1>

        {/* Room selector */}
        <div className="mb-4 relative">
          <label className="block text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-1.5">Room</label>
          <select
            className="w-full bg-[#1C2128] border border-[#30363D] rounded-lg px-3 py-2.5 text-sm text-[#ADBAC7] focus:outline-none focus:border-[#1D9E75] transition-colors appearance-none"
            value={room}
            onChange={e => setRoom(e.target.value)}
          >
            <option value="Choose a room" disabled>Choose a room</option>
            {rooms.map(r => <option key={r} value={r}>r/{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 bottom-3 text-[#7D8590] pointer-events-none" />
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-1.5">Title</label>
          <input
            className="w-full bg-[#1C2128] border border-[#30363D] rounded-lg px-3 py-2.5 text-sm text-[#ADBAC7] placeholder-[#7D8590] focus:outline-none focus:border-[#1D9E75] transition-colors"
            placeholder="Give your voice a title..."
          />
        </div>

        {/* Recorder */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mb-4 text-center">
          {!recorded ? (
            <>
              <button
                onClick={() => { if (recording) stopRecording(); else { setRecording(true); setTimer(0); } }}
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 transition-all shadow-2xl ${
                  recording
                    ? "bg-[#993C1D] shadow-[#993C1D]/40 animate-pulse scale-110"
                    : "bg-[#1D9E75] hover:bg-[#17845F] shadow-[#1D9E75]/30 hover:scale-105"
                }`}
              >
                <Mic size={32} className="text-white" />
              </button>
              {recording ? (
                <>
                  <p className="text-sm text-[#993C1D] font-semibold mb-2">Recording... tap to stop</p>
                  <p className="font-mono text-2xl text-[#E6EDF3] font-bold">{fmt(timer)}</p>
                  <div className="mt-3"><Waveform playing={true} height={40} color="#993C1D" /></div>
                </>
              ) : (
                <p className="text-sm text-[#7D8590]">Tap to record</p>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-[#E6EDF3] mb-3">Recording ready · {fmt(timer)}</p>
              <VoicePlayer duration={fmt(timer)} effect={`${selectedEffect === "Normal" ? "🎤" : selectedEffect === "Robot" ? "🤖" : selectedEffect === "Deep" ? "🔊" : "🐿️"} ${selectedEffect}`} />
              <button
                onClick={() => { setRecorded(false); setRecording(false); setTimer(0); }}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#7D8590] hover:text-[#ADBAC7] transition-colors mx-auto"
              >
                <RefreshCw size={12} /> Re-record
              </button>
            </div>
          )}
        </div>

        {/* Effects */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">Choose Effect</p>
          <div className="grid grid-cols-4 gap-2">
            {effects.map(({ label, free }) => (
              <button
                key={label}
                onClick={() => free && setSelectedEffect(label)}
                className={`relative py-2.5 rounded-lg text-xs font-medium transition-all border ${
                  !free
                    ? "border-[#30363D] text-[#7D8590] opacity-60 cursor-default"
                    : selectedEffect === label
                    ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]"
                    : "border-[#30363D] text-[#ADBAC7] hover:border-[#7D8590]"
                }`}
              >
                {!free && <span className="absolute top-0.5 right-1 text-[8px]">🔒</span>}
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 bg-[#854F0B]/10 border border-[#854F0B]/30 rounded-lg px-3 py-2 text-xs text-amber-400">
            🔒 Unlock 20+ effects with <span className="font-semibold">VoicePro</span> — ₹99/mo
          </div>
        </div>

        {/* Evidence & Anon */}
        <div className="space-y-3 mb-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={showEvidence} onChange={e => setShowEvidence(e.target.checked)} className="w-4 h-4 accent-[#1D9E75]" />
              <div>
                <p className="text-sm font-medium text-[#E6EDF3]">📎 Add photo as proof / context</p>
                <p className="text-xs text-[#7D8590]">Attach an image to your post</p>
              </div>
            </label>
            {showEvidence && (
              <div className="mt-3 border-2 border-dashed border-[#30363D] rounded-lg p-6 text-center hover:border-[#1D9E75]/50 transition-colors">
                <Camera size={24} className="mx-auto text-[#7D8590] mb-2" />
                <p className="text-xs text-[#7D8590]">Drop image here or <span className="text-[#1D9E75]">browse</span></p>
              </div>
            )}
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#E6EDF3]">🎭 Post anonymously</p>
                <p className="text-xs text-[#7D8590] mt-0.5">Your identity will be hidden. Voice will be auto-disguised.</p>
              </div>
              <button
                onClick={() => setAnon(!anon)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${anon ? "bg-[#1D9E75]" : "bg-[#30363D]"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${anon ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tags & Settings */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">📍 Tag as</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                  selectedTag === t
                    ? "bg-[#1D9E75] border-[#1D9E75] text-white"
                    : "border-[#30363D] text-[#7D8590] hover:border-[#7D8590]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-[#7D8590]">
            {["NSFW", "Spoiler"].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer hover:text-[#ADBAC7] transition-colors">
                <input type="checkbox" className="w-3.5 h-3.5 accent-[#1D9E75]" />
                {t}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => setScreen(2)}
          className="w-full bg-[#1D9E75] hover:bg-[#17845F] text-white rounded-full py-3 text-sm font-semibold transition-colors shadow-lg shadow-[#1D9E75]/20 mb-2"
        >
          Post Voice
        </button>
        <button className="w-full text-center text-xs text-[#7D8590] hover:text-[#ADBAC7] transition-colors py-1">
          Save as Draft
        </button>
      </main>
    </div>
  );
}

// ─── SCREEN 5 — Room Page ────────────────────────────────────────────────────
function Screen5({ setScreen }: { setScreen: (n: number) => void }) {
  const [activeTab, setActiveTab] = useState("Posts");
  const [joined, setJoined] = useState(false);
  const tabs = ["Posts", "Top", "New", "Rising", "About"];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0">
        {/* Banner */}
        <div className="relative h-28 rounded-xl overflow-hidden mb-0 -mx-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1117] via-[#1D9E75]/20 to-[#534AB7]/20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Waveform playing={true} height={112} />
          </div>
        </div>

        {/* Room header */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl px-5 py-4 mb-4 relative">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#534AB7] flex items-center justify-center flex-shrink-0 border-4 border-[#161B22] -mt-10">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#E6EDF3]">r/SpillTheTea</h1>
              <p className="text-xs text-[#7D8590]">2.1M members · 4.2K listening now</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setJoined(!joined)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all border ${
                  joined ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/10"
                }`}
              >
                {joined ? "Joined" : "Join"}
              </button>
              <button className="w-9 h-9 border border-[#30363D] rounded-full flex items-center justify-center text-[#7D8590] hover:text-[#ADBAC7] hover:border-[#7D8590] transition-colors">
                <Bell size={15} />
              </button>
              <button className="w-9 h-9 border border-[#30363D] rounded-full flex items-center justify-center text-[#7D8590] hover:text-[#ADBAC7] hover:border-[#7D8590] transition-colors">
                <Share2 size={15} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeTab === t
                    ? "bg-[#1D9E75] text-white"
                    : "text-[#7D8590] hover:text-[#ADBAC7] hover:bg-[#1C2128]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== "About" ? (
          <div className="space-y-3">
            {POSTS.map(p => (
              <PostCard key={p.id} post={p} onClick={() => setScreen(3)} />
            ))}
          </div>
        ) : (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
            <h3 className="font-semibold text-[#E6EDF3] mb-3">About r/SpillTheTea</h3>
            <p className="text-sm text-[#7D8590] leading-relaxed mb-4">The most authentic corner of the internet where you drop the tea — in your actual voice. No filters, no scripts, just raw stories.</p>
            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              {[["2.1M", "Members"], ["4.2K", "Online now"], ["Jan 2024", "Created"], ["Top 1%", "Community"]].map(([v, l]) => (
                <div key={l} className="bg-[#1C2128] rounded-lg p-3">
                  <p className="font-bold text-[#1D9E75]">{v}</p>
                  <p className="text-[10px] text-[#7D8590]">{l}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <aside className="w-72 flex-shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-3 space-y-3">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">About r/SpillTheTea</p>
            <p className="text-xs text-[#7D8590] leading-relaxed mb-3">The most authentic corner of the internet. Drop the tea in your own voice.</p>
            <div className="flex justify-between text-xs mb-4">
              <div><p className="font-bold text-[#E6EDF3]">2.1M</p><p className="text-[#7D8590]">Members</p></div>
              <div><p className="font-bold text-[#1D9E75]">4.2K</p><p className="text-[#7D8590]">Online</p></div>
            </div>
            <button onClick={() => setScreen(4)} className="w-full bg-[#1D9E75] hover:bg-[#17845F] text-white rounded-full py-2 text-xs font-semibold transition-colors">
              Create Voice Post
            </button>
          </div>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">Room Rules</p>
            {["1. Keep it authentic — no scripted posts", "2. Voice notes only (no text posts)", "3. Respect anonymity", "4. No hate speech or harassment", "5. Tag your posts correctly"].map(r => (
              <p key={r} className="text-xs text-[#ADBAC7] py-1.5 border-b border-[#30363D] last:border-0">{r}</p>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── SCREEN 6 — Profile ──────────────────────────────────────────────────────
function Screen6({ setScreen }: { setScreen: (n: number) => void }) {
  const [activeTab, setActiveTab] = useState("Voice Posts");
  const [following, setFollowing] = useState(false);
  const tabs = ["Voice Posts", "Replies", "Saved", "About"];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0">
        {/* Banner */}
        <div className="relative h-28 rounded-xl overflow-hidden mb-4 bg-gradient-to-r from-[#1D9E75]/20 via-[#534AB7]/20 to-[#0D1117]">
          <div className="absolute inset-0 opacity-5 flex items-center"><Waveform playing={true} height={112} /></div>
        </div>

        {/* Profile header */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl px-5 py-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#534AB7] flex items-center justify-center flex-shrink-0 border-4 border-[#161B22] -mt-10 text-white font-bold text-xl">
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[#E6EDF3]">u/ShadowVoice_42</h1>
                <span className="flex items-center gap-1 bg-[#1D9E75]/20 text-[#1D9E75] text-[10px] font-semibold rounded-full px-2 py-0.5 border border-[#1D9E75]/30">
                  <Check size={9} /> Verified
                </span>
              </div>
              <p className="text-xs text-[#7D8590]">Voice since March 2024</p>
              <div className="flex gap-5 mt-2 text-xs">
                {[["2.4K", "Followers"], ["891", "Following"], ["12.4K", "Listen mins"], ["234", "Posts"]].map(([v, l]) => (
                  <div key={l}>
                    <span className="font-semibold text-[#E6EDF3]">{v}</span>
                    <span className="text-[#7D8590] ml-1">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setFollowing(!following)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
                  following ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75]/10"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button className="border border-[#30363D] text-[#7D8590] rounded-full px-3 py-1.5 text-xs hover:border-[#7D8590] transition-colors">
                Message
              </button>
              <button className="w-8 h-8 border border-[#30363D] rounded-full flex items-center justify-center text-[#7D8590] hover:border-[#7D8590] transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeTab === t ? "bg-[#1D9E75] text-white" : "text-[#7D8590] hover:text-[#ADBAC7] hover:bg-[#1C2128]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {POSTS.map(p => (
            <div key={p.id} className="relative">
              <PostCard post={p} onClick={() => setScreen(3)} />
              <div className="absolute top-3 right-14 flex items-center gap-1 text-[10px] text-[#7D8590] bg-[#1C2128] rounded-full px-2 py-0.5">
                <Radio size={9} className="text-[#1D9E75]" /> {(p.votes * 12).toLocaleString()} listens
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside className="w-72 flex-shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-3 space-y-3">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">About</p>
            <p className="text-xs text-[#7D8590] leading-relaxed mb-4">Anonymous storyteller. Dropping the truths nobody else will say — one voice note at a time. 🎤</p>
            <div className="space-y-2 text-xs">
              <p className="text-[#ADBAC7]"><span className="text-[#7D8590]">Top rooms: </span>r/SpillTheTea, r/TrueConfessions, r/WorkStories</p>
              <p className="text-[#ADBAC7] flex items-center gap-1"><Gift size={11} className="text-amber-400" /> <span className="text-[#7D8590]">Earnings: </span>₹2,340 total</p>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest">Blue Tick Progress</p>
              <Check size={12} className="text-[#1D9E75]" />
            </div>
            {[
              { label: "Followers", val: 2400, max: 2400, done: true },
              { label: "Listen mins", val: 12400, max: 10000, done: true },
            ].map(({ label, val, max, done }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-[10px] text-[#7D8590] mb-1">
                  <span>{label}</span>
                  <span className={done ? "text-[#1D9E75]" : ""}>{val.toLocaleString()} / {max.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-[#1C2128] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${Math.min(100, (val / max) * 100)}%` }} />
                </div>
              </div>
            ))}
            <p className="text-[10px] text-[#1D9E75] font-medium">✓ Blue Tick earned!</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── SCREEN 7 — Notifications ────────────────────────────────────────────────
function Screen7({ setScreen }: { setScreen: (n: number) => void }) {
  const [activeTab, setActiveTab] = useState("All");
  const [readAll, setReadAll] = useState(false);
  const tabs = ["All", "Reactions", "Replies", "Followers", "Gifts"];

  const notifs = [
    { icon: "🔥", text: "r/WorkStories upvoted your voice post", sub: '"My boss said..."', time: "2hr ago", unread: true, action: null },
    { icon: "🎤", text: "u/DeepVoice99 replied to your post", sub: "Listen to reply", time: "3hr ago", unread: true, action: "listen" },
    { icon: "🎁", text: "u/Anonymous gifted you 👑 Crown (₹100)", sub: null, time: "5hr ago", unread: true, action: null },
    { icon: "👤", text: "u/CollegeKid_Mumbai started following you", sub: null, time: "6hr ago", unread: false, action: "follow" },
    { icon: "❤️", text: "45 people reacted to your voice post", sub: null, time: "1day ago", unread: false, action: null },
    { icon: "🔵", text: "Congratulations! You earned a Blue Tick", sub: "Keep creating great content!", time: "2days ago", unread: false, action: null },
  ];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0 pt-3 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-[#E6EDF3]">Notifications</h1>
          <button onClick={() => setReadAll(true)} className="text-xs text-[#1D9E75] hover:text-[#17845F] transition-colors">
            Mark all read
          </button>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === t ? "bg-[#1D9E75] text-white" : "bg-[#1C2128] text-[#7D8590] hover:text-[#ADBAC7]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {notifs.map((n, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                n.unread && !readAll
                  ? "bg-[#161B22] border-[#1D9E75]/20 hover:border-[#1D9E75]/40"
                  : "bg-[#161B22] border-[#30363D] opacity-70 hover:opacity-100"
              }`}
            >
              {n.unread && !readAll && (
                <div className="w-2 h-2 rounded-full bg-[#1D9E75] flex-shrink-0" />
              )}
              <span className="text-xl flex-shrink-0">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#E6EDF3]">
                  {n.text}{" "}
                  {n.sub && <span className="text-[#7D8590] italic">"{n.sub}"</span>}
                </p>
                <p className="text-[11px] text-[#7D8590] mt-0.5">{n.time}</p>
              </div>
              {n.action === "listen" && (
                <button onClick={() => setScreen(3)} className="flex items-center gap-1 text-xs text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-full px-3 py-1.5 hover:bg-[#1D9E75]/20 transition-colors flex-shrink-0">
                  <Play size={10} fill="currentColor" /> Listen
                </button>
              )}
              {n.action === "follow" && (
                <button className="text-xs text-[#1D9E75] border border-[#1D9E75] rounded-full px-3 py-1.5 hover:bg-[#1D9E75]/10 transition-colors flex-shrink-0">
                  Follow back
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── SCREEN 8 — Search ───────────────────────────────────────────────────────
function Screen8({ setScreen }: { setScreen: (n: number) => void }) {
  const [query, setQuery] = useState("My boss");
  const [activeTab, setActiveTab] = useState("Posts");
  const tabs = ["Posts", "Rooms", "People", "Transcripts"];

  const trending = ["#WorkConfessions", "#CollegeLife", "#SpillTheTea", "#RelationshipAdvice", "#AnonymousStories"];

  return (
    <div className="flex gap-6">
      <LeftSidebar setScreen={setScreen} />
      <main className="flex-1 min-w-0 pt-3">
        <div className="relative mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D8590]" />
          <input
            className="w-full bg-[#1C2128] border border-[#1D9E75] rounded-xl pl-10 pr-4 py-3 text-sm text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search voices, rooms, topics..."
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D8590] hover:text-[#ADBAC7] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === t ? "bg-[#1D9E75] text-white" : "bg-[#1C2128] text-[#7D8590] hover:text-[#ADBAC7]"
              }`}
            >
              {t}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-1 text-xs text-[#7D8590] bg-[#1C2128] rounded-full px-3 py-1.5 hover:text-[#ADBAC7] transition-colors flex-shrink-0">
            <Filter size={11} /> Filter
          </button>
        </div>

        {activeTab === "Posts" && (
          <div className="space-y-3">
            <p className="text-xs text-[#7D8590]">
              {POSTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.transcript.toLowerCase().includes(query.toLowerCase())).length || POSTS.length} results for <span className="text-[#1D9E75] font-medium">"{query}"</span>
            </p>
            {POSTS.map(p => (
              <PostCard key={p.id} post={p} onClick={() => setScreen(3)} />
            ))}
          </div>
        )}

        {activeTab === "Rooms" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROOMS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setScreen(5)}
                className="flex items-center gap-3 bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#1D9E75]/40 transition-colors text-left"
              >
                <Avatar seed={r.seed} size={10} text={r.name} />
                <div>
                  <p className="font-medium text-[#E6EDF3] text-sm">r/{r.name}</p>
                  <p className="text-xs text-[#7D8590]">{r.members} members</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "People" && (
          <div className="space-y-2">
            {["ShadowVoice_42", "night_owl_kriti", "DeepVoice99", "corporate_rant99", "hostelboi_iit"].map((u, i) => (
              <div key={u} className="flex items-center gap-3 bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#1D9E75]/40 transition-colors">
                <Avatar seed={i} size={9} text={u} />
                <div className="flex-1">
                  <p className="font-medium text-[#E6EDF3] text-sm">u/{u}</p>
                  <p className="text-xs text-[#7D8590]">{(1000 + i * 347).toLocaleString()} followers · {(i + 1) * 89} posts</p>
                </div>
                <button className="text-xs text-[#1D9E75] border border-[#1D9E75] rounded-full px-3 py-1.5 hover:bg-[#1D9E75]/10 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Transcripts" && (
          <div className="space-y-3">
            {POSTS.map(p => (
              <div key={p.id} onClick={() => setScreen(3)} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 cursor-pointer hover:border-[#1D9E75]/40 transition-colors">
                <p className="text-sm font-medium text-[#E6EDF3] mb-2">{p.title}</p>
                <p className="text-xs text-[#7D8590] italic leading-relaxed">
                  "...{p.transcript.split(query.toLowerCase()).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <mark className="bg-[#1D9E75]/30 text-[#1D9E75] rounded px-0.5">{query}</mark>}
                    </span>
                  ))}..."
                </p>
                <p className="text-[10px] text-[#7D8590] mt-2">r/{p.room} · {p.time}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <aside className="w-72 flex-shrink-0 hidden xl:block">
        <div className="sticky top-16 pt-3 space-y-3">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-widest mb-3">Trending</p>
            {trending.map((t, i) => (
              <button
                key={t}
                onClick={() => setQuery(t.replace("#", ""))}
                className="w-full flex items-center justify-between py-2 text-xs hover:text-[#1D9E75] transition-colors group border-b border-[#30363D] last:border-0"
              >
                <span className="flex items-center gap-2 text-[#ADBAC7] group-hover:text-[#1D9E75]">
                  <Hash size={11} className="text-[#7D8590]" />{t}
                </span>
                <ChevronRight size={11} className="text-[#7D8590]" />
              </button>
            ))}
          </div>
          <RightSidebarRooms setScreen={setScreen} />
        </div>
      </aside>
    </div>
  );
}

// ─── Screen Nav ──────────────────────────────────────────────────────────────
const SCREEN_LABELS = [
  "", "Landing", "Home", "Post Detail", "Create Post", "Room Page", "Profile", "Notifications", "Search"
];

function ScreenNav({ screen, setScreen, loggedIn }: { screen: number; setScreen: (n: number) => void; loggedIn: boolean }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#161B22]/95 backdrop-blur border border-[#30363D] rounded-2xl px-2 py-1.5 shadow-2xl">
      {SCREEN_LABELS.slice(1).map((label, i) => {
        const n = i + 1;
        const isActive = screen === n;
        return (
          <button
            key={n}
            onClick={() => setScreen(n)}
            className={`rounded-xl px-2.5 py-1 text-[10px] font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-[#1D9E75] text-white shadow-sm"
                : "text-[#7D8590] hover:text-[#ADBAC7] hover:bg-[#1C2128]"
            }`}
          >
            {n}. {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, 'Segoe UI', sans-serif" }}>
      <Navbar screen={screen} setScreen={setScreen} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <div className="pt-12 pb-20 px-4 max-w-[1200px] mx-auto">
        {screen === 1 && <Screen1 setScreen={setScreen} setLoggedIn={setLoggedIn} />}
        {screen === 2 && <Screen2 setScreen={setScreen} />}
        {screen === 3 && <Screen3 setScreen={setScreen} />}
        {screen === 4 && <Screen4 setScreen={setScreen} />}
        {screen === 5 && <Screen5 setScreen={setScreen} />}
        {screen === 6 && <Screen6 setScreen={setScreen} />}
        {screen === 7 && <Screen7 setScreen={setScreen} />}
        {screen === 8 && <Screen8 setScreen={setScreen} />}
      </div>

      <ScreenNav screen={screen} setScreen={setScreen} loggedIn={loggedIn} />

      <style>{`
        html { scrollbar-width: none; }
        html::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        select option { background: #1C2128; }
      `}</style>
    </div>
  );
}
