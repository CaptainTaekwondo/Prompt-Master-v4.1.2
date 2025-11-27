
import React from 'react';

const PrivacyPolicy = () => {
    // Basic styling for readability
    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            padding: '40px 20px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'sans-serif',
            lineHeight: '1.6',
            color: '#333',
        },
        header: {
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
            marginBottom: '20px',
        },
        section: {
            marginBottom: '30px',
        },
        h1: {
            fontSize: '2.5em',
        },
        h2: {
            fontSize: '1.8em',
            marginTop: '0',
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.h1}>Privacy Policy</h1>
            </header>

            <section style={styles.section}>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    Welcome to PROMPT MASTER ("we", "us", "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>1. Information We Collect</h2>
                <p>
                    We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul>
                    <li>
                        <strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the Site (e.g., through Google Sign-In).
                    </li>
                    <li>
                        <strong>User-Generated Content:</strong> Any text, ideas, or prompts you enter into our application are processed to provide the service. We store your generated prompts in your account history for your convenience.
                    </li>
                    <li>
                        <strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, and the pages you have viewed. This data is used for analytics and to improve our service.
                    </li>
                </ul>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>2. How We Use Your Information</h2>
                <p>
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Provide you with the core service of generating and saving prompts.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Notify you of updates to the Site.</li>
                    <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                </ul>
            </section>
            
            <section style={styles.section}>
                <h2 style={styles.h2}>3. Disclosure of Your Information</h2>
                <p>
                    We do not share, sell, rent, or trade your personal information with any third parties for their commercial purposes.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>4. Security of Your Information</h2>
                <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>5. Policy for Children</h2>
                <p>
                    We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>6. Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                </p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.h2}>7. Contact Us</h2>
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Address]
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
