import React from 'react';
import { Link } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const values = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 28, color: '#4F46E5' }} />,
    title: 'Access to Knowledge',
    desc: 'We believe every person deserves access to books and the knowledge they contain, regardless of background or location.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 28, color: '#7C3AED' }} />,
    title: 'Community First',
    desc: 'Reading is better together. Our platform connects readers, enabling friendships, conversations, and book exchanges.',
  },
  {
    icon: <EmojiObjectsIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'Innovation',
    desc: 'We use modern technology — from AI assistants to smart search — to make library management effortless.',
  },
  {
    icon: <FavoriteIcon sx={{ fontSize: 28, color: '#EF4444' }} />,
    title: 'Passion for Reading',
    desc: 'Built by readers for readers. Every feature is designed to make your reading journey more enjoyable.',
  },
];

const features = [
  { icon: <MenuBookIcon />, title: 'Smart Book Catalog', desc: 'Browse thousands of books with powerful search and genre filtering.' },
  { icon: <SwapHorizIcon />, title: 'P2P Book Exchange', desc: 'Share your personal books and borrow from other community members.' },
  { icon: <SmartToyIcon />, title: 'AI Library Assistant', desc: 'Get instant answers about your loans, fines, and book recommendations.' },
  { icon: <NotificationsIcon />, title: 'Smart Notifications', desc: 'Never miss a due date with email reminders and in-app alerts.' },
];

const stats = [
  { value: '10,000+', label: 'Books in catalog' },
  { value: '500+', label: 'Active members' },
  { value: '50+', label: 'Genres covered' },
  { value: '99.6%', label: 'Uptime' },
];

const AboutPage = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    {/* Hero */}
    <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            <span>About Kitep Space</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Bringing Libraries{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Into the Digital Age
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Kitep Space is a modern library management platform built to connect readers,
            simplify book borrowing, and foster a community built around the love of reading.
          </p>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {s.value}
              </div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We started Kitep Space because we saw libraries struggling with outdated systems
              that frustrated both librarians and readers alike. Overdue notices sent by hand,
              no way to check availability online, and no community features.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our mission is simple: make library services as easy and enjoyable as ordering
              something online. We want every reader to feel empowered, connected, and inspired.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">
              Join Us Today <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{v.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What We've Built</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A complete library ecosystem with features designed for modern readers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                {React.cloneElement(f.icon, { sx: { fontSize: 28 } })}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-3xl mx-auto px-4 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Your Reading Journey</h2>
        <p className="text-indigo-100 text-lg mb-8">
          Join thousands of readers who have already discovered a better way to read.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
            Create Free Account <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Link>
          <Link to="/books"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
            Browse Books
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutPage;
