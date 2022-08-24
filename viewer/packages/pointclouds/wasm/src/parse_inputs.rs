use nalgebra::Const;
use std::vec::Vec;

use crate::linalg::{vec3, Mat4, Vec3, Vec3WithIndex};
use crate::shapes;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct InputCylinder {
    pub center_a: [f64; 3],
    pub center_b: [f64; 3],
    pub radius: f64,
}

#[derive(Debug, Deserialize)]
struct InputOrientedBox {
    inv_instance_matrix: [f64; 16],
}

#[derive(Debug, Deserialize)]
pub struct InputShape {
    pub object_id: u16,
    cylinder: Option<Box<InputCylinder>>,
    oriented_box: Option<Box<InputOrientedBox>>,
}

pub fn parse_points(
    input_array: &js_sys::Float32Array,
    input_point_offset: Vec<f64>,
) -> Vec<Vec3WithIndex> {
    let point_offset = Vec3::new(
        input_point_offset[0],
        input_point_offset[1],
        input_point_offset[2],
    );

    let num_points = input_array.length() / 3;
    let mut point_vec = Vec::<Vec3WithIndex>::with_capacity(num_points as usize);

    for i in 0..num_points {
        point_vec.push(Vec3WithIndex {
            vec: vec3(
                input_array.get_index(3 * i + 0) as f64,
                input_array.get_index(3 * i + 1) as f64,
                input_array.get_index(3 * i + 2) as f64,
            ) + point_offset,
            index: i,
        });
    }

    point_vec
}

fn create_cylinder(input: InputCylinder, id: u16) -> Box<shapes::cylinder::Cylinder> {
    Box::<shapes::cylinder::Cylinder>::new(shapes::cylinder::Cylinder::new(
        vec3(input.center_a[0], input.center_a[1], input.center_a[2]),
        vec3(input.center_b[0], input.center_b[1], input.center_b[2]),
        input.radius,
        id,
    ))
}

fn create_box(input: InputOrientedBox, id: u16) -> Box<shapes::oriented_box::OrientedBox> {
    Box::<shapes::oriented_box::OrientedBox>::new(shapes::oriented_box::OrientedBox::new(
        Mat4::from_column_slice_generic(Const, Const, &input.inv_instance_matrix),
        id,
    ))
}

fn create_shape(obj: InputShape) -> Box<dyn shapes::shape::Shape> {
    if obj.cylinder.is_some() {
        create_cylinder(*obj.cylinder.unwrap(), obj.object_id)
    } else if obj.oriented_box.is_some() {
        create_box(*obj.oriented_box.unwrap(), obj.object_id)
    } else {
        panic!("Unrecognized input shape");
    }
}

pub fn parse_objects(
    input_shapes: Vec<wasm_bindgen::prelude::JsValue>,
) -> Vec<Box<dyn shapes::shape::Shape>> {
    let mut shape_vec =
        Vec::<Box<dyn shapes::shape::Shape>>::with_capacity(input_shapes.len() as usize);

    for value in input_shapes.iter() {
        let input_shape = value.into_serde::<InputShape>().unwrap();
        shape_vec.push(create_shape(input_shape));
    }

    shape_vec
}
