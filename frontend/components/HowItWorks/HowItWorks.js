'use client';
import { motion } from 'framer-motion';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Browse Campaigns',
    description: 'Discover active group buying campaigns for premium clothing at wholesale prices.',
    icon: '🔍',
  },
  {
    number: '02',
    title: 'Join the Group',
    description: 'Select your size and color, then join the campaign. Your spot is reserved instantly.',
    icon: '🤝',
  },
  {
    number: '03',
    title: 'Hit the Goal',
    description: 'Once the campaign reaches its target quantity, the bulk order is placed automatically.',
    icon: '🎯',
  },
  {
    number: '04',
    title: 'Save Big',
    description: 'Everyone in the group gets the item at the wholesale bulk-order price. Shipped to your door.',
    icon: '📦',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>Simple Process</p>
          <h2 className={styles.title}>How It Works</h2>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {steps.map((step) => (
            <motion.div key={step.number} className={styles.card} variants={itemVariants}>
              <div className={styles.iconWrap}>{step.icon}</div>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
