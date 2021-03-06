import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import apiHandler from '../api/apiHandler';
import UserContext from '../components/Auth/UserContext';
import '../styles/Display.scss';
import '../styles/Edit.scss';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { TextareaAutosize } from '@material-ui/core';
import { objectToFormData } from 'object-to-formdata';
import Error from '../components/Error';
import { withUser } from '../components/Auth/withUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

/*

To Do:
- Remove creator from list of contributors

*/

class CollabEdit extends Component {
  state = {
    categoryOptions: [],
    skillOptions: [],
    saved: true,
    title: '',
    creator: '',
    contributors: [],
    allUsers: [],
    description: '',
    skillsNeeded: [],
    categoryNeeded: [],
    image: '',
    open: false,
    error: undefined,
  };

  componentDidMount() {
    apiHandler.getCollab(this.props.match.params.id).then((apiRes) => {
      this.setState(apiRes);
    });
    apiHandler.getCategories().then((apiRes) => {
      this.setState({ categoryOptions: apiRes });
    });
    apiHandler.getSkills().then((apiRes) => {
      this.setState({ skillOptions: apiRes });
    });
    apiHandler.getUsers().then((apiRes) => {
      this.setState({ allUsers: apiRes });
    });
  }
  handleFormChange = (e) => {
    if (e.target.name === 'image') {
      if (e.target.files[0].size > 750000) {
        this.setState({ error: 'Maximum file size: 750kb' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({ temporaryPicture: reader.result });
      };
      reader.readAsDataURL(e.target.files[0]);
      this.setState({ image: e.target.files[0], saved: false });
    } else {
      this.setState({ [e.target.name]: e.target.value, saved: false });
    }
  };
  handleError = (error) => {
    this.setState({ error: undefined });
  };
  handleFormSubmit = (e) => {
    e.preventDefault();
    if (!this.state.title) {
      this.setState({ error: 'Please enter a title' });
      return;
    }
    if (!this.state.description) {
      this.setState({ error: 'Please enter a description' });
      return;
    }
    let collab = { ...this.state };
    delete collab.saved;
    delete collab.skillOptions;
    delete collab.categoryOptions;
    delete collab.temporaryPicture;
    delete collab._id;
    delete collab.allUsers;
    if (collab.contributors) {
      collab.contributors = JSON.stringify(collab.contributors);
    }
    if (collab.skillsNeeded) {
      collab.skillsNeeded = JSON.stringify(collab.skillsNeeded);
    }
    if (collab.categoryNeeded) {
      collab.categoryNeeded = JSON.stringify(collab.categoryNeeded);
    }
    const formData = objectToFormData(collab);
    apiHandler.patchCollab(this.state._id, formData).then((apiRes) => {
      this.setState({ apiRes });
      this.setState({ saved: true });
    });
  };
  handleCategoryChange = (e, value) => {
    this.setState({ categoryNeeded: value, saved: false });
  };
  handleSkillChange = (e, value) => {
    this.setState({ skillsNeeded: value, saved: false });
  };
  handleUserChange = (e, value) => {
    this.setState({ contributors: value, saved: false });
  };
  handleView = (e) => {
    e.preventDefault();
    if (!this.state.saved) {
      return;
    }
    this.props.history.push('/collab/' + this.props.match.params.id);
  };

  static contextType = UserContext;

  render() {
    // protection on route
    // apiHandler.isLoggedIn().then((res) => {});
    return (
      <>
        {this.state.creator &&
          this.context.user &&
          (this.state.creator._id === this.context.user._id ? null : (
            <Redirect to="/error_404" />
          ))}
        {console.log(this.state.creator._id)}
        <form
          onChange={this.handleFormChange}
          onSubmit={this.handleFormSubmit}
          className="display--collab"
        >
          <label htmlFor="image">
            <div
              className="display__collabimagebox display__imagediv edit__imageedit"
              style={{
                backgroundImage:
                  'url(' +
                  (this.state.temporaryPicture || this.state.image) +
                  ')',
              }}
            >
              <input
                type="file"
                name="image"
                id="image"
                className="input--hidden"
              />
              <FontAwesomeIcon icon={faCamera} />
            </div>
            {/* <div
              className="display__collabimagebox"
              style={{
                backgroundImage:
                  "url(" +
                  (this.state.temporaryPicture || this.state.image) +
                  ")",
              }}
            >
              <input
                type="file"
                name="image"
                id="image"
                className="input--hidden"
              />
            </div> */}
          </label>
          <div className="container display display__collabbody">
            <div className="collab__buttons">
              <span>
                <button
                  className={
                    this.state.saved
                      ? 'btn btn__standard btn__blue btn__inactive'
                      : this.state.title && this.state.description
                      ? 'btn btn__standard btn__green btn__hover'
                      : 'btn btn__standard btn__orange btn__inactive'
                  }
                >
                  {this.state.saved ? 'Saved' : 'Save'}
                </button>
              </span>
              <span>
                <button
                  onClick={this.handleView}
                  className={
                    this.state.saved
                      ? 'btn btn__standard btn__light btn__hover'
                      : 'btn btn__standard btn__faded btn__inactive'
                  }
                >
                  View
                </button>
              </span>
            </div>
            <h2 className="display__collabtitle">
              <TextareaAutosize
                type="text"
                name="title"
                id="title"
                value={this.state.title}
                maxLength={280}
                placeholder="Title"
              />
            </h2>

            <h3 className="display__heading">Description</h3>
            <TextareaAutosize
              type="description"
              name="description"
              id="description"
              value={this.state.description}
              className="display__description"
              placeholder="Description"
            />

            <div className="display__multiselect">
              <h3 className="display__heading">Roles Needed</h3>
              <Autocomplete
                multiple
                onChange={this.handleCategoryChange}
                limitTags={5}
                id="tags-outlined"
                options={this.state.categoryOptions}
                value={this.state.categoryNeeded}
                getOptionLabel={(option) => option.name} // specify what property to use
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
            <div className="display__multiselect">
              <h3 className="display__heading">Skills Needed</h3>
              <Autocomplete
                multiple
                // limitTags={5}
                onChange={this.handleSkillChange}
                id="tags-outlined"
                options={this.state.skillOptions}
                value={this.state.skillsNeeded}
                getOptionLabel={(option) => option.name} // specify what property to use
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
            <div className="display__multiselect">
              <h3 className="display__heading">Contributors</h3>
              <Autocomplete
                multiple
                // limitTags={5}
                onChange={this.handleUserChange}
                id="tags-outlined"
                options={this.state.allUsers}
                value={this.state.contributors}
                getOptionLabel={(option) => option.name} // specify what property to use
                filterSelectedOptions
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
            <ul className="display__bullets">
              <li className="display__bullet">
                <select id="open" value={this.state.open} name="open">
                  <option value={true}>Open to collaborators</option>
                  <option value={false}>
                    Not open to collaborators right now
                  </option>
                </select>
              </li>
              <li className="display__bullet">
                Created by {this.state.creator.name}
              </li>
              {/* <li className="display__bullet">
                Preferred method of contact for {this.state.creator.name}:{" "}
                {this.state.creator.preferredContact}
              </li> */}
            </ul>

            {this.state.userCollab && (
              <div className="display__collabs">
                <h2 className="display__heading">Collabs</h2>
                {this.state.userCollab.map((collab) => {
                  return (
                    <div className="display__collab">
                      <img
                        src={collab.image}
                        alt=""
                        className="display__collabimage"
                      />
                      <h3 className="display__collabtitle">{collab.title}</h3>
                      <p className="display__collabdescription">
                        {collab.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
        {!!this.state.error && (
          <Error error={this.state.error} handleError={this.handleError} />
        )}
      </>
    );
  }
}

export default withUser(CollabEdit);
