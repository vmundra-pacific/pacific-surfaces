import type { Metadata } from "next";
import Link from "next/link";

/**
 * Privacy Policy.
 *
 * Required by Meta (Facebook / Instagram) Ads, Google Ads, the
 * Google Play / App Store review pipelines, and most other ad/data
 * platforms. Also satisfies the EU/UK GDPR, the India DPDP Act 2023,
 * and the California CCPA/CPRA "make your privacy practices
 * available" obligations.
 *
 * Drafted in a formal legal register: defined terms in initial
 * capitals, numbered clauses, statutory references, lawful-basis
 * language under GDPR Article 6, and explicit data subject rights.
 *
 * Implementation note: rendered as a single Server Component with
 * hand-typed sections rather than from Sanity so the wording is
 * locked to git history (audit trail) and any future amendment
 * requires a pull request.
 */
export const metadata: Metadata = {
  title: "Privacy Policy — Pacific Surfaces",
  description:
    "Pacific Surfaces' Privacy Policy. The collection, processing, use, disclosure, transfer, retention, and protection of Personal Data, together with the rights of data subjects under applicable data-protection laws.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#0a1620] min-h-screen">
      {/* Hero band */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-28 pb-12 lg:pt-36 lg:pb-16">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-5 block">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.05]">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm text-pacific-mid font-light">
            Currently in force.
          </p>
        </div>
      </section>

      {/* Body */}
      <section>
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 lg:py-24 text-pacific-light font-light leading-relaxed">
          <p className="text-lg">
            This Privacy Policy (the &ldquo;Policy&rdquo;) sets out the
            terms upon which Pacific Surfaces and its affiliated entities
            (collectively, &ldquo;Pacific Surfaces,&rdquo;
            &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) collect, use, disclose, transfer, retain,
            and otherwise process Personal Data of individuals
            (each, a &ldquo;Data Subject&rdquo; or &ldquo;you&rdquo;) who
            access or interact with the website located at{" "}
            <Link href="/" className="underline hover:text-white">
              pacific-surfaces.com
            </Link>{" "}
            (the &ldquo;Site&rdquo;) or who otherwise engage with the
            Company in connection with the design, manufacture,
            distribution, sale, or marketing of quartz, granite,
            semi-precious-stone, and engineered-surface products
            (collectively, the &ldquo;Services&rdquo;).
          </p>
          <p className="mt-4">
            This Policy is issued in accordance with applicable
            data-protection legislation, including, where applicable, the
            European Union General Data Protection Regulation (Regulation
            (EU) 2016/679) (&ldquo;GDPR&rdquo;), the United Kingdom Data
            Protection Act 2018, the California Consumer Privacy Act of
            2018, as amended by the California Privacy Rights Act
            (collectively, the &ldquo;CCPA&rdquo;), the Digital Personal
            Data Protection Act, 2023 of India (&ldquo;DPDP Act&rdquo;),
            and any other privacy or data-protection law that may apply
            to a particular processing activity (collectively, the
            &ldquo;Applicable Laws&rdquo;).
          </p>
          <p className="mt-4">
            By accessing the Site or submitting Personal Data to the
            Company, you acknowledge that you have read, understood, and
            agree to be bound by this Policy. If you do not agree, you
            must refrain from using the Site and from submitting Personal
            Data to us.
          </p>

          {/* 1. Definitions */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            1. Definitions
          </h2>
          <p className="mb-4">
            In this Policy, unless the context otherwise requires:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              &ldquo;<strong className="text-white font-medium">Personal Data</strong>&rdquo;
              means any information relating to an identified or
              identifiable natural person, including without limitation
              the categories of information enumerated in Clause 3 below;
            </li>
            <li>
              &ldquo;<strong className="text-white font-medium">Processing</strong>&rdquo;
              means any operation or set of operations performed on
              Personal Data, including collection, recording, organisation,
              structuring, storage, adaptation, retrieval, consultation,
              use, disclosure, transmission, dissemination, alignment,
              restriction, erasure, or destruction;
            </li>
            <li>
              &ldquo;<strong className="text-white font-medium">Data Controller</strong>&rdquo;
              means the natural or legal person which, alone or jointly
              with others, determines the purposes and means of the
              Processing of Personal Data;
            </li>
            <li>
              &ldquo;<strong className="text-white font-medium">Processor</strong>&rdquo;
              means a natural or legal person which processes Personal
              Data on behalf of a Data Controller;
            </li>
            <li>
              &ldquo;<strong className="text-white font-medium">Services</strong>&rdquo;
              has the meaning ascribed in the preamble above and
              includes the operation of the Site, the Visualizer tool,
              and all customer-facing activities of the Company.
            </li>
          </ul>

          {/* 2. Data Controller */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            2. Identity of the Data Controller
          </h2>
          <p className="mb-4">
            For the purposes of the Applicable Laws, Pacific Surfaces is
            the Data Controller of the Personal Data processed in
            connection with the Services, save where this Policy or
            another agreement expressly provides otherwise. Enquiries
            concerning this Policy or the Processing of your Personal
            Data may be addressed to the Company in accordance with
            Clause 16 below.
          </p>

          {/* 3. Categories of Personal Data */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            3. Categories of Personal Data Processed
          </h2>

          <h3 className="text-lg font-medium text-white mt-6 mb-2">
            3.1 Personal Data provided directly by the Data Subject
          </h3>
          <p className="mb-4">
            The Company processes the following categories of Personal
            Data which a Data Subject voluntarily submits through the
            Site, by electronic mail, by telephonic or messaging
            communication, or through any other channel of correspondence
            with the Company:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              Identity Data, including full name, salutation, designation,
              employer or trading name, and professional capacity (for
              example, architect, designer, fabricator, dealer,
              distributor, end-customer);
            </li>
            <li>
              Contact Data, including postal address, billing address,
              shipping address for the dispatch of samples, email
              address, telephone number, and WhatsApp number;
            </li>
            <li>
              Location Data, including city, postal code (PIN, ZIP, or
              equivalent), country, and any project location
              communicated to the Company;
            </li>
            <li>
              Commercial Data, including specifications, finishes,
              dimensions, quantities, applications, and any other detail
              relating to a project enquiry, quotation, or sample
              request;
            </li>
            <li>
              Communications Data, including the content of messages,
              briefs, applications, and any free-text submission;
            </li>
            <li>
              Employment Data submitted in connection with a career
              application, including curriculum vitae, cover letter,
              work history, educational qualifications, and references;
            </li>
            <li>
              User-Generated Content uploaded to the Visualizer feature
              of the Site, the Processing of which is governed by
              Clause 5 below.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-2">
            3.2 Personal Data collected automatically
          </h3>
          <p className="mb-4">
            Upon a Data Subject&apos;s access to the Site, the Company
            and its Processors automatically record the following
            categories of Technical Data:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              Internet Protocol (IP) address (recorded in approximate
              form sufficient for inference of country or region);
            </li>
            <li>
              device, operating system, browser type and version, and
              viewport configuration;
            </li>
            <li>
              referring uniform resource locator (URL), session-level
              traffic source data, and campaign identifiers (including
              UTM parameters);
            </li>
            <li>
              pages and resources accessed, time spent on each, products
              viewed, filters applied, links clicked, and other usage
              metadata;
            </li>
            <li>
              diagnostic, error, and performance telemetry necessary to
              maintain the security, integrity, and availability of the
              Site.
            </li>
          </ul>

          {/* 4. Purposes and Legal Bases */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            4. Purposes of Processing and Lawful Bases
          </h2>
          <p className="mb-4">
            The Company processes Personal Data only for specified,
            explicit, and legitimate purposes, and only to the extent
            permitted by a lawful basis under the Applicable Laws. The
            principal purposes and corresponding lawful bases are as
            follows:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              <strong className="text-white font-medium">
                Performance of a contract or pre-contractual steps
              </strong>{" "}
              (GDPR Article 6(1)(b)) — to respond to enquiries, prepare
              quotations, dispatch samples, evaluate job applications,
              and otherwise take steps requested by you;
            </li>
            <li>
              <strong className="text-white font-medium">
                Legitimate interests
              </strong>{" "}
              (GDPR Article 6(1)(f)) — to operate, secure, and improve
              the Site and the Services; to measure the performance of
              our marketing campaigns; to manage business relationships
              with dealers, fabricators, suppliers, and partners; and to
              defend our legal rights. Such Processing is balanced
              against the rights and freedoms of Data Subjects;
            </li>
            <li>
              <strong className="text-white font-medium">
                Consent
              </strong>{" "}
              (GDPR Article 6(1)(a) and Section 6 of the DPDP Act) — for
              non-essential cookies, direct marketing communications, and
              any other Processing for which consent is required by law.
              Such consent may be withdrawn at any time without affecting
              the lawfulness of Processing carried out before the
              withdrawal;
            </li>
            <li>
              <strong className="text-white font-medium">
                Compliance with a legal obligation
              </strong>{" "}
              (GDPR Article 6(1)(c)) — to comply with applicable tax,
              customs, export-control, employment, and other statutory
              and regulatory requirements;
            </li>
            <li>
              <strong className="text-white font-medium">
                Vital interests and public interest
              </strong>{" "}
              (GDPR Article 6(1)(d) and (e)) — only in limited
              circumstances where Processing is necessary to protect a
              person&apos;s life or to perform a task in the public
              interest.
            </li>
          </ul>
          <p className="mb-4">
            The Company does not engage in any solely automated
            decision-making producing legal or similarly significant
            effects upon Data Subjects without human intervention.
          </p>

          {/* 5. Visualizer */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            5. Visualizer Feature: User-Generated Imagery
          </h2>
          <p className="mb-4">
            The Site offers a Visualizer feature which permits a Data
            Subject to upload a photograph of a room or surface
            (&ldquo;Uploaded Imagery&rdquo;) and to preview thereon the
            appearance of selected Pacific Surfaces slabs. The Company
            processes Uploaded Imagery solely for the purpose of
            performing the visualisation requested and only for the
            duration of the Data Subject&apos;s active session. The
            Company:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              does not use Uploaded Imagery to identify any natural
              person;
            </li>
            <li>
              does not use Uploaded Imagery to train, tune, or otherwise
              develop machine-learning models;
            </li>
            <li>
              does not disclose Uploaded Imagery to any third party
              unrelated to the rendering of the requested preview;
            </li>
            <li>
              does not retain a long-term copy of Uploaded Imagery
              beyond what is necessary to render the preview.
            </li>
          </ul>
          <p className="mb-4">
            Data Subjects are advised to refrain from uploading
            photographs containing identifying features (such as
            faces, identification documents, or licence plates), the
            Processing of which is not required for the visualisation
            purpose and which fall outside the intended use of the
            feature.
          </p>

          {/* 6. Cookies */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            6. Cookies and Similar Technologies
          </h2>
          <p className="mb-4">
            The Company uses cookies, browser local storage, pixels, web
            beacons, and similar technologies (collectively,
            &ldquo;Tracking Technologies&rdquo;) for the following
            purposes:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              <strong className="text-white font-medium">
                Strictly necessary Tracking Technologies
              </strong>{" "}
              required to operate the Site, including those that retain
              Visualizer session state, favourites, and dealer-search
              inputs;
            </li>
            <li>
              <strong className="text-white font-medium">
                Analytics Tracking Technologies
              </strong>{" "}
              that enable aggregated measurement of Site usage and
              feature performance;
            </li>
            <li>
              <strong className="text-white font-medium">
                Advertising Tracking Technologies
              </strong>{" "}
              that enable conversion measurement, frequency capping, and
              audience attribution in respect of the Company&apos;s
              advertising campaigns on Meta and Google.
            </li>
          </ul>
          <p className="mb-4">
            A Data Subject may control non-essential Tracking
            Technologies through the settings of their browser. Refusal
            of certain categories may impair Site functionality.
          </p>

          {/* 7. Third Parties */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            7. Engagement of Processors and Advertising Partners
          </h2>
          <p className="mb-4">
            The Company engages the following categories of Processors
            and service partners, each of which processes Personal Data
            on the Company&apos;s behalf pursuant to a written agreement
            incorporating obligations of confidentiality, security, and
            (where applicable) the standard contractual clauses
            published by the European Commission:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              <strong className="text-white font-medium">
                Hosting and content-delivery providers
              </strong>{" "}
              — providing the infrastructure on which the Site is
              served;
            </li>
            <li>
              <strong className="text-white font-medium">
                Content-management providers
              </strong>{" "}
              — storing the editorial content, product imagery, and
              dealer records that populate the Site;
            </li>
            <li>
              <strong className="text-white font-medium">Google</strong>{" "}
              (in respect of Google Analytics, Google Ads, and Google
              Tag Manager) — providing aggregate analytics, conversion
              tracking, and advertising-measurement services;
            </li>
            <li>
              <strong className="text-white font-medium">
                Meta Platforms
              </strong>{" "}
              (in respect of Facebook, Instagram, and WhatsApp Business)
              — providing advertising-measurement, conversion-tracking,
              audience-targeting, and business-messaging services. A
              Data Subject may manage advertising preferences within
              their Meta account at any time;
            </li>
            <li>
              <strong className="text-white font-medium">
                Email and messaging service providers
              </strong>{" "}
              — facilitating transactional and marketing communications
              and the receipt of enquiries submitted through the Site;
            </li>
            <li>
              <strong className="text-white font-medium">
                Payment processors and logistics providers
              </strong>{" "}
              — facilitating sample dispatch and commercial transactions
              effected through or in connection with the Site.
            </li>
          </ul>
          <p className="mb-4">
            Each such Processor processes Personal Data subject to its
            own privacy notice, which Data Subjects are encouraged to
            consult.
          </p>

          {/* 8. Disclosures */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            8. Disclosures of Personal Data
          </h2>
          <p className="mb-4">
            The Company does not sell Personal Data within the meaning
            of the CCPA or any other Applicable Law. The Company may
            disclose Personal Data only in the following circumstances:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              to Processors and service partners as set out in Clause 7,
              acting upon documented instructions of the Company;
            </li>
            <li>
              to authorised dealers, fabricators, or distributors of
              Pacific Surfaces products, where a Data Subject has
              requested an introduction or referral through, inter alia,
              the Find A Dealer feature of the Site;
            </li>
            <li>
              to other entities within the Pacific Group, where such
              disclosure is necessary for the performance of the
              Services or for the operation of shared corporate
              functions;
            </li>
            <li>
              to law-enforcement authorities, courts, regulators, or
              other competent bodies, where required by law or where
              necessary to establish, exercise, or defend legal claims;
            </li>
            <li>
              to a successor entity in connection with a merger,
              acquisition, divestiture, restructuring, insolvency
              proceeding, or sale of all or part of the business or
              assets of the Company, subject to the recipient&apos;s
              undertaking to honour the terms of this Policy.
            </li>
          </ul>

          {/* 9. International Transfers */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            9. International Transfers of Personal Data
          </h2>
          <p className="mb-4">
            The Company operates internationally. Personal Data may
            accordingly be transferred to, stored in, and processed in
            jurisdictions other than the Data Subject&apos;s country of
            residence. Where such transfer is made from the European
            Economic Area, the United Kingdom, or any other jurisdiction
            imposing transfer restrictions, the Company implements one
            or more of the following safeguards: (i) the standard
            contractual clauses approved by the European Commission
            and, where applicable, the United Kingdom International
            Data Transfer Addendum; (ii) reliance on an adequacy
            decision of the relevant regulator; or (iii) such other
            lawful transfer mechanism as may be available.
          </p>

          {/* 10. Retention */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            10. Retention of Personal Data
          </h2>
          <p className="mb-4">
            The Company retains Personal Data only for so long as is
            necessary to fulfil the purposes for which it was collected,
            including any retention period required by law or imposed by
            audit, accounting, tax, or customs regulations. Indicative
            retention periods are as follows:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              enquiry, sample request, and quotation correspondence:
              retained for a reasonable period following the most
              recent interaction, reflecting the typical specification
              cycle of architectural and design projects;
            </li>
            <li>
              recruitment records: retained for the duration of the
              recruitment process and, with the Data Subject&apos;s
              consent, such further period as may be relevant for the
              consideration of future vacancies;
            </li>
            <li>
              newsletter and marketing subscription data: retained until
              the Data Subject withdraws consent or unsubscribes;
            </li>
            <li>
              transactional records (including invoices and export
              documentation): retained for the minimum period prescribed
              by applicable tax, customs, and commercial law;
            </li>
            <li>
              analytics data: retained in aggregated and/or pseudonymised
              form for trend analysis.
            </li>
          </ul>
          <p className="mb-4">
            Upon expiry of the applicable retention period, the Company
            shall delete, destroy, or anonymise the relevant Personal
            Data in accordance with its data-disposal procedures.
          </p>

          {/* 11. Rights */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            11. Rights of Data Subjects
          </h2>
          <p className="mb-4">
            Subject to and in accordance with the Applicable Laws, a
            Data Subject may exercise the following rights with respect
            to their Personal Data:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4">
            <li>
              <strong className="text-white font-medium">
                Right of access
              </strong>{" "}
              to confirmation as to whether Personal Data concerning the
              Data Subject is being processed and, if so, access to such
              Personal Data and information concerning the Processing;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to rectification
              </strong>{" "}
              of inaccurate or incomplete Personal Data;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to erasure
              </strong>{" "}
              of Personal Data, subject to applicable legal limitations;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to restriction
              </strong>{" "}
              of Processing in the circumstances set out in Article 18
              of the GDPR and equivalent provisions of other Applicable
              Laws;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to object
              </strong>{" "}
              to Processing carried out on the basis of legitimate
              interests, and to Processing for the purposes of direct
              marketing, at any time and without giving reasons;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to data portability
              </strong>{" "}
              in respect of Personal Data provided by the Data Subject
              and processed by automated means on the basis of consent
              or contract;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to withdraw consent
              </strong>{" "}
              at any time where Processing is based on consent, without
              prejudice to the lawfulness of Processing carried out
              before such withdrawal;
            </li>
            <li>
              <strong className="text-white font-medium">
                Right to lodge a complaint
              </strong>{" "}
              with the supervisory authority having jurisdiction over
              the Data Subject&apos;s habitual residence, place of work,
              or place of the alleged infringement.
            </li>
          </ul>
          <p className="mb-4">
            A Data Subject wishing to exercise any of the foregoing
            rights may submit a written request to{" "}
            <a
              href="mailto:info@thepacific.group"
              className="underline hover:text-white"
            >
              info@thepacific.group
            </a>{" "}
            bearing the subject line &ldquo;Privacy Request.&rdquo; The
            Company may require reasonable evidence of identity prior
            to actioning a request and shall respond within the time
            period prescribed by the Applicable Laws (and in any event
            within thirty (30) days where no specific period applies).
          </p>

          {/* 12. Security */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            12. Security of Processing
          </h2>
          <p className="mb-4">
            The Company implements appropriate technical and
            organisational measures to ensure a level of security
            appropriate to the risks presented by the Processing,
            including, without limitation, encryption of Personal Data
            in transit by means of Transport Layer Security (TLS),
            access controls on the principle of least privilege, regular
            review of access rights, network monitoring of the hosting
            infrastructure, secure-development practices, and incident-
            response procedures. Notwithstanding the foregoing, no
            method of transmission over the internet or method of
            electronic storage is absolutely secure, and the Company
            cannot guarantee unconditional security.
          </p>

          {/* 13. Children */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            13. Children
          </h2>
          <p className="mb-4">
            The Site is directed exclusively to a professional and
            adult audience, namely architects, designers, fabricators,
            dealers, distributors, and adult end-customers specifying or
            procuring surfaces for residential or commercial
            applications. The Company does not knowingly collect
            Personal Data from any person under the age of sixteen (16)
            years. Should it come to the Company&apos;s attention that
            Personal Data of a child has been collected without verified
            parental consent, such data shall be deleted without undue
            delay.
          </p>

          {/* 14. Third-party links */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            14. Links to Third-Party Properties
          </h2>
          <p className="mb-4">
            The Site may from time to time contain links to websites,
            applications, or other digital properties operated by third
            parties (including dealers, social-media platforms, press
            publications, and industry organisations). The Company is
            not responsible for the privacy practices of such third
            parties, and Data Subjects are advised to review the privacy
            notices of those properties prior to providing Personal Data
            to them.
          </p>

          {/* 15. Amendments */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            15. Amendments to this Policy
          </h2>
          <p className="mb-4">
            The Company may amend this Policy from time to time to
            reflect changes in its Processing activities, applicable
            legislation, or the engagement of new Processors. The
            current version of the Policy is the version published on
            the Site under the heading &ldquo;Currently in force.&rdquo;
            Material amendments shall be communicated to Data Subjects
            by such means as the Company considers appropriate,
            including by means of a notice on the Site or by inclusion
            in marketing correspondence. Continued use of the Site
            following the publication of an amended Policy constitutes
            acceptance of such amendment.
          </p>

          {/* 16. Contact */}
          <h2 className="text-2xl font-light tracking-tight text-white mt-12 mb-4">
            16. Notices and Contact Details
          </h2>
          <p className="mb-4">
            Any notice, request, or other communication concerning this
            Policy or the Processing of Personal Data should be
            addressed to:
          </p>
          <p className="mb-4">
            Pacific Surfaces
            <br />
            For the attention of: Data Protection
            <br />
            Email:{" "}
            <a
              href="mailto:info@thepacific.group"
              className="underline hover:text-white"
            >
              info@thepacific.group
            </a>
            <br />
            Telephone:{" "}
            <a href="tel:+919894033566" className="underline hover:text-white">
              +91 98940 33566
            </a>
          </p>

          <p className="mt-12 pt-8 border-t border-white/10 text-xs text-pacific-mid">
            By accessing or using pacific-surfaces.com, a Data Subject
            acknowledges that they have read and understood this Policy
            in its entirety.
          </p>
        </div>
      </section>
    </main>
  );
}
