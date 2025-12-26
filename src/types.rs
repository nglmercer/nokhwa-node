use nokhwa::utils::CameraIndex as NokhwaIndex;

/// Camera index representation
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CameraIndex(pub String);

impl CameraIndex {
    pub fn new(index: String) -> Self {
        Self(index)
    }
}

impl From<NokhwaIndex> for CameraIndex {
    fn from(value: NokhwaIndex) -> Self {
        CameraIndex(value.as_string())
    }
}

impl From<CameraIndex> for NokhwaIndex {
    fn from(value: CameraIndex) -> Self {
        NokhwaIndex::String(value.0)
    }
}

impl std::fmt::Display for CameraIndex {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}
