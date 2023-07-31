import * as Color from 'color';

import { Colors } from '../Primitives/Colors';

export class Appearance {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  // App
  static ApplicationDefaultFontSize = 0.75; // in rem units relative to default HTML

  static ApplicationPanelHeaderFontSize = 0.875; // in rem units relative to default HTML

  static tooltipDisplayDelay = 800; // delay for displaying tooltip, in milliseconds

  // Tree control
  static treeIndentation = 20; // Controls tree indentation in pixels

  static treeItemGap = 2; // Controls item vertical gap

  static treeIconSize = 20; // Tree icons size in pixel

  static treeBackgroundColor?: Color = undefined; // Use brush instead here?

  // Toolbar
  static toolbarIconSize = 26; // Toolbar icon size  in pixel

  static toolbarSelectWidth = 91; // Toolbar Select Width in pixel

  static toolbarCommandsPerLine = 19; // Commands per line in toolbar

  // Panel sizes
  static leftPanelDefaultSize = 350; // Default size of left panel

  static leftPanelMaxSize = 1000; // Maximum size of left panel

  // Settings Panel
  static valuesPerColorMap = 20; // values in color map image

  static generalSettingsName = 'General Settings';

  static statisticsName = 'Statistics';

  static visualSettingsName = 'Visual Settings';

  static generalSettingsDefaultExpanded = true;

  static statisticsDefaultExpanded = false;

  static visualSettingsDefaultExpanded = true;

  static readonlyInputColor = Color.rgb(217, 247, 253).hex();

  // For the viewer
  static viewerFooter = ' ';

  static viewerIsLightBackground = false; // True is white, False is black

  static viewerSmallestCameraDeltaAngle = Math.PI / 100;

  static viewerFontType = '"Inter", sans-serif'; // "Helvetica" Use brush instead here?

  static viewerOverlayFontSize = 14;

  static viewerFooterFontSize = 16;

  static viewerOverlayFgColor: Color = Color.rgb([38, 38, 38]);

  static viewerOverlayFgSecondaryColor: Color = Color.rgb([89, 89, 89]);

  static viewerOverlayBgColor: Color = Colors.white;
}
