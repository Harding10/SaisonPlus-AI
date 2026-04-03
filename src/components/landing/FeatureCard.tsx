import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialIcon } from '@/components/ui/material-icon';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

export function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.05 }}
      className="group"
    >
      <Card className="h-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#32d74b] to-[#22c55e] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-[#32d74b] transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-slate-600 text-center">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}