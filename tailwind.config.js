/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			'teal': {
    				'50': '#EBFFFE',
    				'100': '#ADFFFA',
    				'200': '#00F5E4',
    				'300': '#00D6C8',
    				'400': '#00B3A7',
    				'500': '#008279',
    				'600': '#00756D',
    				'700': '#00665F',
    				'800': '#005751',
    				'900': '#003834',
    				'950': '#002E2B'
    			},
    			'purple': {
    				'50': '#F5F5FF',
    				'100': '#E6E6FF',
    				'200': '#CECDFE',
    				'300': '#ABA9FE',
    				'400': '#8381FD',
    				'500': '#2522FC',
    				'600': '#0803FC',
    				'700': '#0703D8',
    				'800': '#0502AB',
    				'900': '#04028D',
    				'950': '#030165'
    			},
    			'amber': {
    				'50': '#FFF5EB',
    				'100': '#FFE7CC',
    				'200': '#FFCD94',
    				'300': '#FFA947',
    				'400': '#F08000',
    				'500': '#B05F00',
    				'600': '#9E5400',
    				'700': '#8A4900',
    				'800': '#703C00',
    				'900': '#4D2900',
    				'950': '#3D2100'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
    },

    plugins: [require("tailwindcss-animate")],
};
