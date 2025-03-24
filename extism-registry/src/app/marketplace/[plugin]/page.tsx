import { PluginDetail } from '../plugin-detail';

export default function PluginPage({ params }: { params: { plugin: string } }) {
  return <PluginDetail pluginName={decodeURIComponent(params.plugin)} />;
} 