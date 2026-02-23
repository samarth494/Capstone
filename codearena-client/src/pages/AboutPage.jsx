import { motion } from 'framer-motion';
import { Shield, Target, Users, Code, Globe, Award, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-200 dark:selection:bg-blue-900/40 selection:text-blue-900 dark:selection:text-blue-100 font-sans transition-colors duration-300">
            {/* Navigation */}
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                            <Swords className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">CodeArena_</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <button onClick={() => navigate('/')} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</button>
                            <button onClick={() => navigate('/events')} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Events</button>
                            <button onClick={() => navigate('/login')} className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-blue-700 transition-all text-sm font-bold shadow-sm">Log In</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-16 pb-24">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 transition-colors">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 mr-2"></span>
                            Our Mission
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 font-mono tracking-tight transition-colors">
                            Empowering Developers <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Through Competition</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors">
                            CodeArena is where code meets sport. We're building the ultimate playground for developers to learn, compete, and grow together.
                        </p>
                    </motion.div>
                </section>

                {/* Stats Section */}
                <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16 mb-20 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Active Users', value: '10K+', icon: Users },
                                { label: 'Battles Fought', value: '500K+', icon: Target },
                                { label: 'Countries', value: '120+', icon: Globe },
                                { label: 'Tournaments', value: '50+', icon: Award },
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                        <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">{stat.value}</div>
                                    <div className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 transition-colors">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-mono transition-colors">The CodeArena Story</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed transition-colors">
                                Founded in 2024, CodeArena started with a simple idea: coding shouldn't be a solitary activity. We wanted to bring the excitement of e-sports to software development.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed transition-colors">
                                What began as a small project for a university hackathon has grown into a global community of passionate developers. We believe that competition drives innovation, and that the best way to master a skill is to test it against others.
                            </p>
                            <div className="flex items-center space-x-4 pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />
                                    ))}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Joined by 10,000+ devs</div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-2xl bg-slate-900 overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-32 h-32 text-white/10" />
                                </div>

                                {/* Abstract Code UI Elements */}
                                <div className="absolute top-10 left-10 right-10 p-6 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg">
                                    <div className="flex space-x-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                                        <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Blob */}
                            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/30 dark:bg-blue-900/20 blur-3xl rounded-full transition-colors duration-300"></div>
                        </motion.div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-slate-900 dark:bg-slate-950/50 py-20 text-white transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 font-mono">Our Core Values</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">The principles that guide every feature we build and every line of code we write.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Community First', desc: 'We build for the developers, by the developers. The community voice drives our roadmap.' },
                                { title: 'Always Learning', desc: 'Failure is just another test case. We encouarge experimentation and continuous improvement.' },
                                { title: 'Fair Play', desc: 'Integrity is paramount. Our anti-cheat systems and fair matchmaking ensure a level playing field.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-800 dark:bg-slate-900 p-8 rounded-xl border border-slate-700 dark:border-slate-800 hover:border-blue-500 transition-colors">
                                    <h3 className="text-xl font-bold mb-3 text-blue-400">{item.title}</h3>
                                    <p className="text-slate-300 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* Simple Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 text-center text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
                <p>&copy; 2026 CodeArena. Built with ❤️ for developers.</p>
            </footer>
        </div>
    );
}
