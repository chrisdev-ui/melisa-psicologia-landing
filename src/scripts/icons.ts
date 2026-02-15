import {
  createIcons,
  ArrowRight,
  Award,
  Baby,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle,
  Clock3,
  Compass,
  Facebook,
  GraduationCap,
  Heart,
  HeartHandshake,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Play,
  Quote,
  Send,
  Shield,
  Sparkles,
  Users,
  Video,
} from 'lucide/dist/esm/lucide/src/lucide.js';

const iconSet = {
  ArrowRight,
  Award,
  Baby,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle,
  Clock3,
  Compass,
  Facebook,
  GraduationCap,
  Heart,
  HeartHandshake,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Play,
  Quote,
  Send,
  Shield,
  Sparkles,
  Users,
  Video,
};

const initIcons = () => {
  try {
    createIcons({ icons: iconSet });
  } catch (error) {
    console.error('Error al inicializar iconos', error);
  }
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons, { once: true });
  } else {
    initIcons();
  }
}
