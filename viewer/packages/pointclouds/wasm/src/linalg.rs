
use nalgebra::base::Matrix4;
use nalgebra_glm::{TVec3, TVec4};

pub type Vec3 = TVec3<f64>;
pub type Vec4 = TVec4<f64>;
pub type Mat4 = Matrix4<f64>;

#[derive(Clone,Copy,Debug)]
pub struct BoundingBox {
    pub min: Vec3,
    pub max: Vec3
}

#[derive(Clone,Copy,Debug)]
pub struct Vec3WithIndex {
    pub vec: Vec3,
    pub index: u32
}

pub fn vec3(x: f64, y: f64, z: f64) -> Vec3 {
    return Vec3::new(x, y, z);
}

pub fn vec4(x: f64, y: f64, z: f64, w: f64) -> Vec4 {
    return Vec4::new(x, y, z, w);
}

pub fn to_bounding_box(input_bounding_box: &crate::InputBoundingBox) -> BoundingBox {
    BoundingBox {
        min: Vec3::new(input_bounding_box.min[0],
                       input_bounding_box.min[1],
                       input_bounding_box.min[2]),
        max: Vec3::new(input_bounding_box.max[0],
                       input_bounding_box.max[1],
                       input_bounding_box.max[2])
    }
}

pub fn boxes_overlap(b0: &BoundingBox, b1: &BoundingBox) -> bool {
    return
        b0.min.x < b1.max.x && b0.max.x > b1.min.x &&
        b0.min.y < b1.max.y && b0.max.y > b1.min.y &&
        b0.min.z < b1.max.z && b0.max.z > b1.min.z;
}
