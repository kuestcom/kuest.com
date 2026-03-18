import type {ComponentType} from "react";
import type {ShowcaseIconName} from "@/lib/marketing-shared-data";
import {
    Activity,
    BarChart2,
    Bitcoin,
    Bot,
    Clapperboard,
    Globe2,
    Landmark,
    MonitorSmartphone,
    Moon,
    Server,
    Share2,
    ShieldCheck,
    SlidersHorizontal,
    Sun,
    TrendingUp,
    Trophy,
    Users,
    Zap,
    FlameIcon,
} from "lucide-react";
const showcaseIconMap: Record<ShowcaseIconName, ComponentType<{ className?: string }>> = {
    activity: Activity,
    "bar-chart-2": BarChart2,
    bitcoin: Bitcoin,
    bot: Bot,
    clapperboard: Clapperboard,
    "globe-2": Globe2,
    landmark: Landmark,
    "monitor-smartphone": MonitorSmartphone,
    moon: Moon,
    server: Server,
    "share-2": Share2,
    "shield-check": ShieldCheck,
    sliders: SlidersHorizontal,
    sun: Sun,
    trophy: Trophy,
    "trending-up": TrendingUp,
    users: Users,
    zap: Zap,
    flame: FlameIcon,
};

export default function ShowcaseIcon({name}: { name: ShowcaseIconName }) {
    const Icon = showcaseIconMap[name] ?? Zap;

    return <Icon/>;
}