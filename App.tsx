import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type IdeaStatus = 'Idea' | 'Researching' | 'Testing';
type AppTab = 'dashboard' | 'discover' | 'credits';

type Idea = {
  id: string;
  title: string;
  niche: string;
  problem: string;
  audience: string;
  valueProp: string;
  score: number;
  estimatedRevenue: number;
  status: IdeaStatus;
};

type CreditPack = {
  id: string;
  amount: number;
  label: string;
  price: string;
};

const starterIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI Local Lead Finder',
    niche: 'Local services',
    problem: 'SMBs struggle to identify high-intent leads before competitors do.',
    audience: 'Agencies, local consultants, service businesses',
    valueProp: 'A weekly lead list that scores buyer intent and budgets in one dashboard.',
    score: 94,
    estimatedRevenue: 32880,
    status: 'Testing',
  },
  {
    id: 'idea-2',
    title: 'Revenue Recovery Audit',
    niche: 'E-commerce',
    problem: 'Online stores leak money from abandoned carts and silent churn.',
    audience: 'Shopify owners, DTC teams, retention marketers',
    valueProp: 'AI-powered revenue leak detection with a 30-day recovery roadmap.',
    score: 90,
    estimatedRevenue: 24750,
    status: 'Researching',
  },
  {
    id: 'idea-3',
    title: 'Creator Prompt Vault',
    niche: 'Creator economy',
    problem: 'Creators waste time rebuilding prompts, scripts, and content ideas.',
    audience: 'YouTubers, TikTok creators, digital agencies',
    valueProp: 'A searchable vault of high-converting prompts, hooks, and scripting templates.',
    score: 86,
    estimatedRevenue: 18400,
    status: 'Idea',
  },
];

const ideaCategories = ['AI tools', 'Creator tools', 'E-commerce', 'Local services', 'Wellness'];

const creditPacks: CreditPack[] = [
  { id: 'credit-5', amount: 5, label: 'Starter pack', price: '$4.99' },
  { id: 'credit-12', amount: 12, label: 'Growth pack', price: '$9.99' },
  { id: 'credit-30', amount: 30, label: 'Pro pack', price: '$22.99' },
];

const storageKey = 'creator-earn-ai-v2';
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const scoreColor = (score: number) => {
  if (score >= 85) return '#34d399';
  if (score >= 70) return '#fbbf24';
  return '#f87171';
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const deriveIdeaFromPrompt = (prompt: string, category: string): Idea => {
  const cleanPrompt = prompt.trim() || 'AI-powered business growth system';
  const keyword = cleanPrompt.split(' ').slice(0, 2).join(' ');
  const title = `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} ${category}`;

  const baseScore = clamp(
    68 + cleanPrompt.length / 7 + (category === 'AI tools' ? 12 : category === 'E-commerce' ? 10 : 8),
    72,
    98
  );

  const revenueBase = clamp(
    9000 + cleanPrompt.length * 90 + (category === 'E-commerce' ? 2200 : category === 'Local services' ? 1600 : 1200),
    12000,
    42000
  );

  return {
    id: `generated-${Date.now()}`,
    title,
    niche: category,
    problem: `Users lose time or revenue because ${cleanPrompt.toLowerCase()} is fragmented or hard to discover.`,
    audience: 'Early-stage founders, agencies, and creators looking for a focused niche offer',
    valueProp: `A tool that simplifies ${cleanPrompt.toLowerCase()} and turns it into a repeatable revenue stream.`,
    score: Math.round(baseScore),
    estimatedRevenue: Math.round(revenueBase),
    status: 'Idea',
  };
};

export default function App() {
  const [tab, setTab] = useState<AppTab>('dashboard');
  const [ideas, setIdeas] = useState<Idea[]>(starterIdeas);
  const [selectedId, setSelectedId] = useState(starterIdeas[0].id);
  const [credits, setCredits] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('AI tools');
  const [prompt, setPrompt] = useState('AI workflow planner for creators selling digital products');
  const [isLoaded, setIsLoaded] = useState(false);

  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === selectedId) ?? ideas[0],
    [ideas, selectedId]
  );

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.ideas)) setIdeas(parsed.ideas);
        if (parsed.selectedId) setSelectedId(parsed.selectedId);
        if (typeof parsed.credits === 'number') setCredits(parsed.credits);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.prompt) setPrompt(parsed.prompt);
      } catch (error) {
        console.warn('Unable to load app state', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({ ideas, selectedId, credits, selectedCategory, prompt })
    ).catch((error) => console.warn('Unable to save app state', error));
  }, [ideas, selectedId, credits, selectedCategory, prompt, isLoaded]);

  const updateSelectedIdea = (field: keyof Idea, value: string | number) => {
    if (!selectedIdea) return;

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) => (idea.id === selectedIdea.id ? { ...idea, [field]: value } : idea))
    );
  };

  const addNewIdea = () => {
    const generated = deriveIdeaFromPrompt(prompt, selectedCategory);
    setIdeas((currentIdeas) => [generated, ...currentIdeas]);
    setSelectedId(generated.id);
    setTab('dashboard');
  };

  const buyCredits = (pack: CreditPack) => {
    setCredits((current) => current + pack.amount);
    Alert.alert('Credit purchase', `${pack.label} added successfully. You now have ${credits + pack.amount} credits.`);
  };

  const refreshRevenue = () => {
    if (!selectedIdea) return;

    const updatedRevenue = Math.round(selectedIdea.score * 280 + selectedIdea.estimatedRevenue * 0.1);
    updateSelectedIdea('estimatedRevenue', updatedRevenue);
    Alert.alert('Revenue estimate refreshed', `${currency.format(updatedRevenue)} estimated monthly revenue.`);
  };

  const netPipeline = ideas.reduce((sum, idea) => sum + idea.estimatedRevenue, 0);
  const bestScore = Math.max(...ideas.map((idea) => idea.score));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Creator opportunity tracker</Text>
            <Text style={styles.title}>CreatorEarn AI</Text>
          </View>
          <Pressable style={styles.creditBadge} onPress={() => setTab('credits')}>
            <Text style={styles.creditText}>{credits} credits</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          {(['dashboard', 'discover', 'credits'] as AppTab[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tab, tab === item && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
                {item === 'dashboard' ? 'Dashboard' : item === 'discover' ? 'Discover' : 'Credits'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Opportunity dashboard</Text>
              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Ideas</Text>
                  <Text style={styles.metricValue}>{ideas.length}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Best score</Text>
                  <Text style={styles.metricValue}>{bestScore}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Pipeline</Text>
                  <Text style={styles.metricValue}>{currency.format(netPipeline)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved ideas</Text>
              <Pressable style={styles.primaryButton} onPress={() => setTab('discover')}>
                <Text style={styles.primaryButtonText}>+ New idea</Text>
              </Pressable>
            </View>

            {ideas.map((idea) => {
              const isSelected = selectedIdea?.id === idea.id;
              return (
                <Pressable
                  key={idea.id}
                  onPress={() => setSelectedId(idea.id)}
                  style={[styles.ideaCard, isSelected && styles.ideaCardSelected]}
                >
                  <View style={styles.ideaTopRow}>
                    <Text style={styles.ideaTitle}>{idea.title}</Text>
                    <Text style={[styles.score, { color: scoreColor(idea.score) }]}>{idea.score}</Text>
                  </View>
                  <Text style={styles.ideaMeta}>{idea.niche}</Text>
                  <Text style={styles.ideaCopy}>{idea.valueProp}</Text>
                  <View style={styles.ideaFooter}>
                    <Text style={styles.revenueText}>{currency.format(idea.estimatedRevenue)}</Text>
                    <Text style={styles.statusText}>{idea.status}</Text>
                  </View>
                </Pressable>
              );
            })}

            {selectedIdea && (
              <View style={styles.editorCard}>
                <View style={styles.editorHeader}>
                  <Text style={styles.sectionTitle}>Idea editor</Text>
                  <Pressable style={styles.secondaryButton} onPress={refreshRevenue}>
                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={selectedIdea.title}
                  onChangeText={(text) => updateSelectedIdea('title', text)}
                />

                <Text style={styles.label}>Niche</Text>
                <TextInput
                  style={styles.input}
                  value={selectedIdea.niche}
                  onChangeText={(text) => updateSelectedIdea('niche', text)}
                />

                <Text style={styles.label}>Core problem</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={selectedIdea.problem}
                  multiline
                  onChangeText={(text) => updateSelectedIdea('problem', text)}
                />

                <Text style={styles.label}>Audience</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={selectedIdea.audience}
                  multiline
                  onChangeText={(text) => updateSelectedIdea('audience', text)}
                />

                <Text style={styles.label}>Value proposition</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={selectedIdea.valueProp}
                  multiline
                  onChangeText={(text) => updateSelectedIdea('valueProp', text)}
                />

                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <Text style={styles.label}>Score</Text>
                    <TextInput
                      style={styles.input}
                      value={String(selectedIdea.score)}
                      keyboardType="numeric"
                      onChangeText={(text) => updateSelectedIdea('score', Number(text || 0))}
                    />
                  </View>

                  <View style={styles.inlineField}>
                    <Text style={styles.label}>Revenue</Text>
                    <TextInput
                      style={styles.input}
                      value={String(selectedIdea.estimatedRevenue)}
                      keyboardType="numeric"
                      onChangeText={(text) => updateSelectedIdea('estimatedRevenue', Number(text || 0))}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Status</Text>
                <TextInput
                  style={styles.input}
                  value={selectedIdea.status}
                  onChangeText={(text) => updateSelectedIdea('status', text as IdeaStatus)}
                />
              </View>
            )}
          </ScrollView>
        )}

        {tab === 'discover' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI idea discovery</Text>
              <Text style={styles.helperText}>Pick a vertical and describe the business opportunity you want to explore.</Text>

              <View style={styles.chipRow}>
                {ideaCategories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.chip, selectedCategory === category && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selectedCategory === category && styles.chipTextActive]}>{category}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Idea prompt</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={prompt}
                multiline
                onChangeText={setPrompt}
              />

              <Pressable style={styles.primaryButtonLarge} onPress={addNewIdea}>
                <Text style={styles.primaryButtonText}>Generate & save idea</Text>
              </Pressable>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <Text style={styles.previewName}>{deriveIdeaFromPrompt(prompt, selectedCategory).title}</Text>
              <Text style={styles.previewMeta}>{selectedCategory}</Text>
              <Text style={styles.previewText}>{deriveIdeaFromPrompt(prompt, selectedCategory).valueProp}</Text>
              <View style={styles.previewFooter}>
                <Text style={styles.revenueText}>{currency.format(deriveIdeaFromPrompt(prompt, selectedCategory).estimatedRevenue)}</Text>
                <Text style={[styles.score, { color: scoreColor(deriveIdeaFromPrompt(prompt, selectedCategory).score) }]}>
                  {deriveIdeaFromPrompt(prompt, selectedCategory).score}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {tab === 'credits' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.purchaseCard}>
              <Text style={styles.cardTitle}>Buy extra credits</Text>
              <Text style={styles.helperText}>Use credits to unlock deeper idea analysis, competitor research, and premium validation reports.</Text>

              {creditPacks.map((pack) => (
                <Pressable key={pack.id} style={styles.purchaseOption} onPress={() => buyCredits(pack)}>
                  <View>
                    <Text style={styles.purchaseLabel}>{pack.label}</Text>
                    <Text style={styles.purchaseMeta}>{pack.amount} extra credits</Text>
                  </View>
                  <Text style={styles.purchasePrice}>{pack.price}</Text>
                </Pressable>
              ))}

              <View style={styles.billingNote}>
                <Text style={styles.billingNoteTitle}>Ready for App Store billing</Text>
                <Text style={styles.billingNoteText}>
                  This screen is prepared for RevenueCat or native StoreKit/Google Play integration when you are ready to publish.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
  },
  creditBadge: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  creditText: {
    color: '#ecfeff',
    fontWeight: '700',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1d4ed8',
  },
  tabText: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#eff6ff',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metric: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  primaryButtonLarge: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  ideaCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  ideaCardSelected: {
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  ideaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ideaTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '82%',
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
  },
  ideaMeta: {
    color: '#7dd3fc',
    fontSize: 12,
    marginBottom: 8,
  },
  ideaCopy: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueText: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  statusText: {
    color: '#a7f3d0',
    fontWeight: '700',
    fontSize: 12,
  },
  editorCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#ecfeff',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  inlineField: {
    flex: 1,
  },
  helperText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#0f766e',
    borderColor: '#14b8a6',
  },
  chipText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#ecfeff',
  },
  previewCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 14,
  },
  previewTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewMeta: {
    color: '#7dd3fc',
    fontSize: 12,
    marginBottom: 8,
  },
  previewText: {
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 4,
  },
  purchaseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  purchaseLabel: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  purchaseMeta: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  purchasePrice: {
    color: '#7dd3fc',
    fontWeight: '800',
  },
  billingNote: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  billingNoteTitle: {
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 6,
  },
  billingNoteText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
  },
});
