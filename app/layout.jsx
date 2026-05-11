import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | Achievers Tech Hub',
        default: 'Achievers Tech Hub – Data Bundle Top-Up'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
