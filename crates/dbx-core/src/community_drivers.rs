use crate::models::connection::DatabaseType;

/// Community-maintained driver entry.
///
/// Unlike built-in drivers in `agent_catalog`, community drivers are
/// maintained in this registry and can be updated independently.
/// Only Rust-native drivers are built-in; Java/Go/other language
/// drivers belong here.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CommunityDriver {
    /// Unique driver key (matches the agent binary / gradle module name)
    pub key: &'static str,
    /// Display label
    pub label: &'static str,
    /// Which database type this driver serves
    pub db_type: DatabaseType,
    /// Profile identifier used in connection config `driver_profile`
    pub profile: &'static str,
    /// Whether visible in the driver store
    pub store_visible: bool,
    /// Icon name (same as used in DatabaseIcon.vue assetIcons)
    pub icon: &'static str,
}

/// Community driver registry.
///
/// To add a new community driver, add an entry here.
/// In the future this may be loaded from a JSON file or cloud service.
const COMMUNITY_DRIVERS: &[CommunityDriver] = &[
    // ── Oracle JDBC drivers ──────────────────────────────────────────
    CommunityDriver {
        key: "oracle",
        label: "Oracle (Legacy)",
        db_type: DatabaseType::Oracle,
        profile: "oracle-legacy",
        store_visible: false,
        icon: "oracle",
    },
    CommunityDriver {
        key: "oracle",
        label: "Oracle (10g)",
        db_type: DatabaseType::Oracle,
        profile: "oracle-10g",
        store_visible: false,
        icon: "oracle",
    },
    CommunityDriver {
        key: "oracle-jdbc17",
        label: "Oracle (OJDBC17)",
        db_type: DatabaseType::Oracle,
        profile: "oracle-jdbc17",
        store_visible: true,
        icon: "oracle",
    },
    CommunityDriver {
        key: "oracle-jdbc8",
        label: "Oracle (OJDBC8)",
        db_type: DatabaseType::Oracle,
        profile: "oracle-jdbc8",
        store_visible: true,
        icon: "oracle",
    },
];

/// All community driver entries.
pub fn entries() -> &'static [CommunityDriver] {
    COMMUNITY_DRIVERS
}

/// Find a community driver by (db_type, profile).
pub fn find_by_profile(db_type: &DatabaseType, profile: &str) -> Option<&'static CommunityDriver> {
    COMMUNITY_DRIVERS
        .iter()
        .find(|d| d.db_type == *db_type && d.profile == profile)
}

/// Find a community driver by its agent key.
pub fn find_by_key(key: &str) -> Option<&'static CommunityDriver> {
    COMMUNITY_DRIVERS.iter().find(|d| d.key == key)
}

/// Iterator over store-visible community driver (key, label) pairs.
pub fn store_entries() -> impl Iterator<Item = (&'static str, &'static str)> {
    COMMUNITY_DRIVERS
        .iter()
        .filter(|d| d.store_visible)
        .map(|d| (d.key, d.label))
}

/// Get the label for a community driver key.
pub fn label_for_key(key: &str) -> Option<&'static str> {
    COMMUNITY_DRIVERS.iter().find(|d| d.key == key).map(|d| d.label)
}
