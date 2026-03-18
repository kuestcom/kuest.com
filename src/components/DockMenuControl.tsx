import {Link} from "@/i18n/navigation";

export default function DockMenuControl({
                                    homeHref,
                                    enterpriseHref,
                                    protocolHref,
                                    active,
                                    openLabel,
                                    menuAriaLabel,
                                    homeLabel,
                                    enterpriseLabel,
                                    protocolLabel,
                                }: {
    homeHref: string;
    enterpriseHref: string;
    protocolHref: string;
    active: "home" | "enterprise" | "protocol";
    openLabel: string;
    menuAriaLabel: string;
    homeLabel: string;
    enterpriseLabel: string;
    protocolLabel: string;
}) {
    return (
        <div className="site-language-control site-nav-control" id="dockSiteNavControl">
            <button
                type="button"
                id="dockSiteNavButton"
                className="dock-theme-toggle site-nav-trigger"
                aria-label={openLabel}
                aria-haspopup="menu"
                aria-expanded="false"
            >
        <span className="site-nav-trigger-bars" aria-hidden="true">
          <span className="site-nav-trigger-line"/>
          <span className="site-nav-trigger-line"/>
          <span className="site-nav-trigger-line"/>
        </span>
            </button>
            <div id="dockSiteNavMenu" className="site-language-menu site-nav-menu" role="menu"
                 aria-label={menuAriaLabel}>
                {active === "home" ? (
                    <span className="site-language-option site-nav-option is-disabled" role="menuitem"
                          aria-disabled="true">
            {homeLabel}
          </span>
                ) : (
                    <Link href={homeHref} className="site-language-option site-nav-option" role="menuitem">
                        {homeLabel}
                    </Link>
                )}
                {active === "enterprise" ? (
                    <span className="site-language-option site-nav-option is-disabled" role="menuitem"
                          aria-disabled="true">
            {enterpriseLabel}
          </span>
                ) : (
                    <Link href={enterpriseHref} className="site-language-option site-nav-option" role="menuitem">
                        {enterpriseLabel}
                    </Link>
                )}
                {active === "protocol" ? (
                    <span className="site-language-option site-nav-option is-disabled" role="menuitem"
                          aria-disabled="true">
            {protocolLabel}
          </span>
                ) : (
                    <Link href={protocolHref} className="site-language-option site-nav-option" role="menuitem">
                        {protocolLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}