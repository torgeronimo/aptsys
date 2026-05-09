import { Building2, ChevronLeft} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();
    return (
    <div className="min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-6">
            <ChevronLeft onClick={()=> navigate('/login')} className="h-6 w-6 text-primary hover:cursor-pointer"/>
            <div className="rounded-2xl bg-primary/10 p-3">
            
            <Building2 className="h-6 w-6 text-primary" />
            </div>

            <div>
            <h1 className="text-2xl font-bold tracking-tight">
                Privacy Policy
            </h1>

            <p className="text-sm text-muted-foreground">
                Last updated: May 2026
            </p>
            </div>
        </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-12">

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                1. Introduction
            </h2>

            <p className="leading-8 text-muted-foreground">
                Apartment Management System (“we”, “our”, or “the system”)
                is committed to protecting your privacy and securely handling
                your property and tenant information. This Privacy Policy
                explains how we collect, use, and safeguard your data while
                using our platform.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                2. Data We Collect
            </h2>

            <ul className="list-disc space-y-3 pl-6 leading-8 text-muted-foreground">
                <li>User account information such as name and email address</li>
                <li>Property and apartment details</li>
                <li>Unit records and tenant information</li>
                <li>Monthly billing records</li>
                <li>Electricity and water tracking data</li>
                <li>Authentication data through Google or Facebook login</li>
            </ul>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                3. How We Use Your Information
            </h2>

            <ul className="list-disc space-y-3 pl-6 leading-8 text-muted-foreground">
                <li>To provide apartment and tenant management services</li>
                <li>To maintain billing and payment records</li>
                <li>To improve application performance and security</li>
                <li>To authenticate and manage user accounts</li>
                <li>To provide customer support and notifications</li>
            </ul>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                4. Data Security
            </h2>

            <p className="leading-8 text-muted-foreground">
                We implement reasonable security measures to protect your data
                against unauthorized access, misuse, loss, or disclosure.
                However, no digital platform can guarantee absolute security.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                5. Third-Party Services
            </h2>

            <p className="leading-8 text-muted-foreground">
                Our platform may use third-party services such as Supabase,
                Google Authentication, and Facebook Authentication for login,
                authentication, hosting, and database services.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                6. User Responsibilities
            </h2>

            <p className="leading-8 text-muted-foreground">
                Users are responsible for maintaining the confidentiality
                of their accounts and ensuring that tenant and property
                information entered into the system complies with
                applicable privacy laws and regulations.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                7. Data Retention
            </h2>

            <p className="leading-8 text-muted-foreground">
                We retain user and property records only as long as
                necessary to provide services and comply with legal
                obligations.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                8. Changes to This Policy
            </h2>

            <p className="leading-8 text-muted-foreground">
                We may update this Privacy Policy periodically.
                Continued use of the platform after changes indicates
                acceptance of the updated policy.
            </p>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                9. AptSys Data Deletion
            </h2>

            <div className="space-y-5 text-muted-foreground">
                <p className="leading-8">
                AptSys uses Facebook Login to provide a seamless
                user experience. We do not store personal data
                beyond what is necessary for core account functions.
                </p>

                <p className="leading-8">
                In compliance with Facebook Platform Rules,
                users may request deletion of app-related data.
                </p>

                <div className="rounded-2xl border border-border bg-muted/40 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                    Request Manual Data Removal
                </h3>

                <p className="leading-8">
                    To request deletion of your account data,
                    please email:
                </p>

                <p className="mt-3 font-medium text-foreground">
                    victorgeronimod@gmail.com
                </p>

                <p className="mt-4 leading-8">
                    Use the subject:
                    <span className="font-medium text-foreground">
                    {' '}“Data Deletion Request”
                    </span>
                </p>

                <p className="mt-4 leading-8">
                    Include your full name and the email associated
                    with your account. Requests are processed within
                    30 days.
                </p>
                </div>
            </div>
            </section>

            {/* Section */}
            <section>
            <h2 className="mb-4 text-2xl font-semibold">
                10. Contact
            </h2>

            <p className="leading-8 text-muted-foreground">
                If you have questions regarding this Privacy Policy,
                contact:
            </p>

            <p className="mt-4 font-medium">
                victorgeronimod@gmail.com
            </p>
            </section>

        </div>
        </main>
    </div>
    )
}