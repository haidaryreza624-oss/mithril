import { StyleSheet, Text, View } from 'react-native';

type Props = {
    label: string;
    value?: string;
    colors: any;
};

export function InfoTile({ label, value, colors }: Props) {
    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{value ?? '—'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
    },
    label: {
        fontSize: 12,
    },
    value: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: '600',
    },
});