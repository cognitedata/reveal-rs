use nalgebra::base::Matrix4;
use nalgebra_glm::{max2, min2, vec4_to_vec3, TVec3, TVec4};

pub type Vec3 = TVec3<f64>;
pub type Vec4 = TVec4<f64>;
pub type Mat4 = Matrix4<f64>;

#[derive(Clone, Copy, Debug)]
pub struct BoundingBox {
    pub min: Vec3,
    pub max: Vec3,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec3WithIndex {
    pub vec: Vec3,
    pub index: u32,
}

pub fn vec3(x: f64, y: f64, z: f64) -> Vec3 {
    return Vec3::new(x, y, z);
}

pub fn vec4(x: f64, y: f64, z: f64, w: f64) -> Vec4 {
    return Vec4::new(x, y, z, w);
}

pub fn to_bounding_box(input_bounding_box: &crate::InputBoundingBox) -> BoundingBox {
    BoundingBox {
        min: Vec3::new(
            input_bounding_box.min[0],
            input_bounding_box.min[1],
            input_bounding_box.min[2],
        ),
        max: Vec3::new(
            input_bounding_box.max[0],
            input_bounding_box.max[1],
            input_bounding_box.max[2],
        ),
    }
}

pub fn boxes_overlap(b0: &BoundingBox, b1: &BoundingBox) -> bool {
    return b0.min.x < b1.max.x
        && b0.max.x > b1.min.x
        && b0.min.y < b1.max.y
        && b0.max.y > b1.min.y
        && b0.min.z < b1.max.z
        && b0.max.z > b1.min.z;
}

impl BoundingBox {
    pub fn empty() -> BoundingBox {
        BoundingBox {
            min: vec3(f64::INFINITY, f64::INFINITY, f64::INFINITY),
            max: vec3(f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY),
        }
    }

    pub fn add_point(&mut self, point: &Vec3) {
        self.min = min2(&self.min, &point);
        self.max = max2(&self.max, &point);
    }

    pub fn contains_point(&self, point: &Vec3) -> bool {
        min2(&self.min, &point) == self.min && max2(&self.max, &point) == self.max
    }

    pub fn get_centered_unit_cube_corner(corner_index: u32) -> Vec4 {
        vec4(
            if (corner_index & 1) == 0 { -0.5 } else { 0.5 },
            if (corner_index & 2) == 0 { -0.5 } else { 0.5 },
            if (corner_index & 4) == 0 { -0.5 } else { 0.5 },
            1.0,
        )
    }

    pub fn get_transformed_unit_cube(matrix: &Mat4) -> BoundingBox {
        let mut bounding_box = BoundingBox::empty();

        for corner_index in 0..8 {
            let corner = BoundingBox::get_centered_unit_cube_corner(corner_index);

            let transformed_corner = matrix * corner;
            bounding_box.add_point(&vec4_to_vec3(&transformed_corner));
        }

        bounding_box
    }
}
