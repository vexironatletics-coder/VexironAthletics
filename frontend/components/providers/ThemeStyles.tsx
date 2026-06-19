import { generateColorSchemeCss } from '@/lib/themes';

export async function ThemeStyles() {
  return (
    <style
      id="theme-presets"
      dangerouslySetInnerHTML={{
        __html: generateColorSchemeCss(),
      }}
    />
  );
}
