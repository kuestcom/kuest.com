import {localeHref, SiteLocale} from "@/i18n/site-config";
import {LANGUAGE_OPTIONS} from "@/lib/marketing-shared-data";
import Image from "next/image";
import {ChevronDown} from "lucide-react";
import {Link} from "@/i18n/navigation";

export default function LanguageControl({
                                    locale,
                                    path,
                                    controlId,
                                    buttonId,
                                    menuId,
                                    flagId,
                                    labelId,
                                    ariaLabel,
                                }: {
    locale: SiteLocale;
    path: string;
    controlId: string;
    buttonId: string;
    menuId: string;
    flagId: string;
    labelId: string;
    ariaLabel: string;
}) {
    const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.code === locale) ?? LANGUAGE_OPTIONS[0];

    return (
        <div className="site-language-control" id={controlId}>
            <button
                type="button"
                id={buttonId}
                className="site-language-trigger"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded="false"
            >
        <span className="site-language-trigger-content">
          <Image
              id={flagId}
              className="site-language-flag"
              src={currentLanguage.flagSrc}
              alt=""
              width={18}
              height={12}
          />
          <span id={labelId} className="site-language-label">
            {currentLanguage.label}
          </span>
        </span>
                <span className="site-language-icon" aria-hidden="true">
          <ChevronDown/>
        </span>
            </button>
            <div id={menuId} className="site-language-menu" role="listbox" aria-label={ariaLabel}>
                {LANGUAGE_OPTIONS.map((option) => (
                    <Link
                        key={option.code}
                        href={localeHref(option.code, path)}
                        className={`site-language-option${option.code === locale ? " is-selected" : ""}`}
                        role="option"
                        aria-selected={option.code === locale}
                    >
            <span className="site-language-option-row">
              <Image
                  className="site-language-flag"
                  src={option.flagSrc}
                  alt=""
                  width={18}
                  height={12}
              />
              <span>{option.label}</span>
            </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}