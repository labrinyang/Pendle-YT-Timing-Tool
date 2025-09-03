import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { ModeToggle } from './ModeToggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { useTheme } from '@/hooks/theme-context';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setTheme } = useTheme();

  const handleGitHubClick = () => {
    window.open('https://github.com/labrinyang/Pendle-YT-Timing-Tool', '_blank');
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLanguage);
  };

  const nextLanguage = i18n.language === 'zh' ? 'en' : 'zh';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 py-2 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and badges */}
          <div className="flex items-center space-x-4">
            {/* Pendle logo */}
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src="/pendle-logo.jpg"
                alt="Pendle Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold">
                {t('header.title')}
              </h1>

              {/* Badges */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-muted badge-enhanced text-muted-foreground text-xs rounded-full">
                  {t('header.secureBackend')}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              {/* GitHub button */}
              <Button
                variant="outline"
                onClick={handleGitHubClick}
                className="flex items-center space-x-2 input-enhanced"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{t('header.github')}</span>
              </Button>
              <ModeToggle />
              {/* Language switcher */}
              <LanguageSwitcher />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:hidden input-enhanced"
                >
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">{t('header.menu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleGitHubClick}>
                  {t('header.github')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toggleLanguage}>
                  {t(`language.${nextLanguage}`)}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {t('modeToggle.toggleTheme')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setTheme('light')}>
                      {t('modeToggle.light')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTheme('dark')}>
                      {t('modeToggle.dark')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTheme('system')}>
                      {t('modeToggle.system')}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
